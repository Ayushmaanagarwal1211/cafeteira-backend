const express = require("express")
const router = express()
const User = require("../models/User")
const Counter = require("../models/counter")
const Dish = require("../models/dish")
const bcrypt = require('bcrypt')
function handleRolesAuthorization(...roles){
    return async function (req,res,next){   
        if(roles.includes(req.user.role.toLowerCase())){
            next()
        }else{
            return res.status(400).send("Not Authorized")
        }
    }   
}


//TODO : Change Password
router.put('/change-pass/:userId',async (req,res)=>{
    console.log(req.params.userId,req.user._id)
    if(req.user._id.toString() !== req.params.userId){
        return res.status(400).send("Not Authorized")
    }
    const user = await User.findById(req.params.userId);
   console.log(req.body.password)
    const hashed_password = await bcrypt.hash(req.body.password, 10);
    user.password = hashed_password
    await user.save()
    return res.status(200).send("Updated Successfully")
    
})

//TODO : Get All users
router.get("/get-users",async (req,res)=>{
    const users = await User.find()
    return res.status(200).json(users)
})

//TODO : Get All users
router.get("/get-merchants",async (req,res)=>{
    const users = await User.find({role:"merchant"})
    return res.status(200).json(users)
})

//TODO: get-user
router.get("/get-user",async (req,res)=>{
    const user = await User.findById(req.user._id).populate("cart.dish")
    return res.status(200).json(user)
})

//TODO : View All Counters
router.get("/get-counters",async (req,res)=>{
    const counters = await Counter.find().populate('merchants dishes')
    return res.status(200).json(counters)
})



//TODO : Change the role of the user
router.put("/change-role/:userId",handleRolesAuthorization("admin"),async (req,res)=>{
    const {role} = req.body;
    if(!["admin","merchant","customer"].includes(role)){
        return res.status(400).send("Not valid Role")
    }
    if(req.params.userId == req.user._id){
        return res.status(400).send("Can't Change Own Role")
    }
    const user = await User.findById(req.params.userId);
    user.role = role
    await user.save()
    console.log(user,"USER",req.body)
    return res.status(200).send("Changes Successfully")
})


//TODO : Remove ALl items
router.put('/remove-all-cart-products/:userId',async (req,res)=>{
    const user = await User.findById(req.params.userId);
    user.cart = []
    await user.save()
    return res.status(200).json(user)
})


// TODO : Counter Routes

router.post("/add-counter",handleRolesAuthorization("admin"), async (req,res)=>{ // TODO: Adding a new Counter
    let {name , merchants} = req.body
    const users = await User.find()
    merchants = merchants.filter(merchant =>users.find(user=>user._id == merchant._id)) 
    const counter = await Counter.create({name , merchants})
    const counters = await Counter.find()
    return res.status(200).json(counters)
})

//TODO : Delete Counter
router.delete("/delete-counter/:counterId",handleRolesAuthorization("admin"), async (req,res)=>{ // TODO: Adding a new Counter
    const counters = await Counter.findByIdAndDelete(req.params.counterId)
    return res.status(200).json(counters)
})


// TODO: revoke or  access to merchant to specific Counter
router.patch("/access-to-merchant/:counterId/:merchantId",handleRolesAuthorization("admin"), async (req,res)=>{
    const {todo} = req.body
    const counter = await Counter.findById(req.params.counterId);
    if(todo == "Revoke"){
        counter.merchants = counter.merchants.filter(merchant => merchant !== req.params.merchantId);
    }else{
        counter.merchants = counter.merchants.push(req.params.merchantId);
    }
    await counter.save()
    return res.status(200).send(counter)
})




// Merchant Roles


//TODO: View Specific Counter Details
router.get("/view-counter/:counterId",handleRolesAuthorization("merchant","customer"),async (req,res)=>{
    const counter = await Counter.findById(req.params.counterId).populate("merchants dishes")
    // if(!counter.merchants.includes(req.user._id)){
    //     return res.status(400).send("Not Authorized")
    // }
    return res.status(200).json(counter)
})

//TODO: Edit Counter Details
router.post("/edit-counter/:counterId",handleRolesAuthorization("admin","merchant"),async (req,res)=>{
    const counter = await Counter.findById(req.params.counterId)
    const {name,merchants} = req.body
    // if(!counter.merchants.includes(req.user._id)){
    //     return res.status(400).send("Not Authorized")
    // }
    counter.name = name ? name : counter.name
    counter.merchants = merchants
    await counter.save()
    const counters = await Counter.find()
    return res.status(200).json(counters)
})

router.post("/add-dish/:counterId",handleRolesAuthorization("merchant"),async (req,res)=>{
    const counter = await Counter.findById(req.params.counterId)
    const {name,price, inStock} = req.body
    if(!counter.merchants.includes(req.user._id)){
        return res.status(400).send("Not Authorized")
    }
    const dish = await Dish.create({name,price, inStock,counter : req.params.counterId });
    counter.dishes.push(dish._id)
    await counter.save()
    return res.status(200).json(counter)
})

router.put("/update-dish/:dishId",handleRolesAuthorization("merchant"),async (req,res)=>{
    let dish = await Dish.findByIdAndUpdate(req.params.dishId,{
        $set:{...req.body}
    });
    

    return res.status(200).json(dish)
})


router.get("/get-counters",handleRolesAuthorization("customer"),async (req,res)=>{
    const counter = await Counter.find().populate("dishes")
    return res.status(200).json(counter)
})

router.get("/search-dish/:dishId",handleRolesAuthorization("customer"),async (req,res)=>{
    const {name} = req.body
    const counters = await Counter.find().populate("dishes")
    const dishes_to_find = counters.filter(data => {
        const dishes = data.dishes
        const result = false
        dishes.forEach(dish => {
            if(dish.name.toLowerCase().includes(name)){
                result = true
            }
        });
        return result
    }) 
    return res.status(200).json(dishes)
})

router.delete("/remove-dish/:counterId/:dishId",handleRolesAuthorization("merchant"),async (req,res)=>{
    const counter = await Counter.findById(req.params.counterId).populate("dishes")
    // const dish = await Dish.findByIdAndDelete(req.params.dishId)
    if(!counter.merchants.includes(req.user._id)){
        return res.status(400).send("Not Authorized")
    }
    counter.dishes = counter.dishes.filter(dish=>dish._id!==req.params.dishId)
    await counter.save()
    return res.status(200).json(counter)
})

module.exports = {userRouter: router}