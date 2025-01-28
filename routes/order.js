const express = require("express")
const router = express()
const User = require("../models/User")
const { refresh_token } = require("../auth/authentication")
const Counter = require("../models/counter")
const Dish = require("../models/dish")
const Order = require("../models/order")
router.get("/get-orders",async (req,res)=>{
    const counters = await Counter.find()
    let orders = await Order.find().populate("counter dish user")
    let user_counters= counters.filter(counter=>counter.merchants.includes(req.user._id))
    user_counters = user_counters.map(data=>data._id.toString())
    // console.log(user_counters,orders)
    orders = orders.filter(order=>{
        return order.counter &&  user_counters.includes(order.counter._id.toString())
    })
    return res.status(200).json(orders)
})

router.get("/get-orders-by-user/:userId",async (req,res)=>{
    const orders = await Order.find({user : req.params.userId}).populate("counter dish user")
    return res.status(200).json(orders)
})

router.post("/add-order", async (req,res)=>{
    const {orders} = req.body



     orders.map(async (data)=>{
        const dish = data.dish
        const counter = data.counterId
        const quantity = data.quantity
         await Order.create({counter,quantity,dish,user:req.user._id})
    })
    return res.status(200).json("SuccessFull")
})


router.put("/change-status/:orderId",async (req,res)=>{
    const order = await Order.findById(req.params.orderId)
    order.completed = !order.completed
    await order.save()
    return res.status(200).json(order.completed)
})
module.exports = {orderRouter: router}