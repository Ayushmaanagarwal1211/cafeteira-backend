const express = require("express")
const router = express()
const User = require("../models/User")
const { refresh_token } = require("../auth/authentication")
const Counter = require("../models/counter")
const Dish = require("../models/dish")
const Order = require("../models/order")
const pagination = require("../pagination")
const order = require("../models/order")


router.get("/get-orders/:status",async (req,res,next)=>{
    const counters = await Counter.find()
    let orders = await Order.find({completed : (req.params.status=="completed"?true:false)}).populate("counter dish user")
    let user_counters= counters.filter(counter=>counter.merchants.includes(req.user._id))
    user_counters = user_counters.map(data=>data._id.toString())
    
    orders = orders.filter(order=>{
        return order.counter &&  user_counters.includes(order.counter._id.toString())
    })
    req.result = orders
    next()
},pagination)

router.get("/get-orders-by-user/:userId/:status",async (req,res,next)=>{
    let orders = await Order.find({user : req.params.userId,completed : (req.params.status=="completed"?true:false)}).populate("counter dish user")
    orders = orders.filter(data=>data.counter)
    req.result = orders
    next()
},pagination)

router.get("/get-all-orders",async (req,res,next)=>{
    let orders = await Order.find().populate("counter dish user")
    // req.result = orders
    return res.status(200).json(orders)
})

router.post("/add-order", async (req,res)=>{
    const {orders} = req.body
     orders.map(async (data)=>{
        const dish = data.dish
        const counter = data.counterId
        const quantity = data.quantity
        const order =  await Order.create({counter,quantity,dish,user:req.user._id,date : new Date(Date.now())})
        console.log(order)
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