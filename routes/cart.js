const express = require("express")
const router = express()
const User = require("../models/User")
const { refresh_token } = require("../auth/authentication")

router.get("/",async (req,res)=>{
    const user = await User.findById(req.user._id).populate("cart.dish")
    return res.status(200).json(user.cart)
})

router.post("/add-dish/:dishId/:counterID", async (req,res)=>{
    let user = await User.findById(req.user._id).populate('cart.dish')
    
    user.cart.push({
        dish  : req.params.dishId,
    })
    
    await user.save()
    user = await User.findById(req.user._id).populate("cart.dish")
    return res.status(200).json(user)
})

router.put("/change-product-count/:dishId", async (req,res)=>{
    let user = await User.findById(req.user._id)
    user.cart = user.cart.map((data)=>{
        if(data._id == req.params.dishId){
            return {...data,count:data.count + req.body.change}
        }
        return data
    })
    await user.save()
    user  = await user.populate("cart.dish")
    return res.status(200).send(req.user.cart)
})


router.put("/remove-product-from-cart/:dishId", async (req,res)=>{
    let user = await User.findById(req.user._id)
    user.cart = user.cart.filter((data)=> data._id.toString() !== req.params.dishId)
    await user.save()
    user  = await user.populate("cart.dish")
    return res.status(200).send(user.cart)
})





module.exports = {cartRouter: router}