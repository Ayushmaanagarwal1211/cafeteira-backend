const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt =  require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET
const refreshTokensSet = new Set()
const User = require('../models/User')

router.post("/",async (req,res)=>{
    const {password,name,email,role} = req.body
    const hashed_password = await bcrypt.hash(password, 10)
    const user = await User.create({password:hashed_password,name,email,role:role.toLowerCase()})
    return res.status(200).json(user)
})

router.delete('/logout',async (req,res)=>{
    refreshTokensSet.delete(req.body.refresh_token)
    return res.status(200).send("Logged Out")
})
 function refresh_token(user){
    const user_to_encrypt = {email:user.email,name:user.name,_id:user._id,role:user.role,cart:user.cart}
    const token = generateToken({...user_to_encrypt})
        refreshTokensSet.add(token)
        return  {user:user_to_encrypt,token}
}

router.post('/login',async (req,res)=>{
    const {password,email} = req.body
    const users = await User.find().populate("cart.dish")
    const user = users.find((data)=>data.email == email)
    if(!user){
        return res.status(400).json("User not found")
    }
    const isCorrect = await bcrypt.compare(password , user.password)
    if(isCorrect){
        const user_to_encrypt = {email,name:user.name,_id:user._id,role:user.role,cart:user.cart}
        const token = generateToken({...user_to_encrypt})
        refreshTokensSet.add(token)
        return  res.status(200).json({user:user_to_encrypt,token})
    }
    return res.status(400).json("Wrong user")
})

async function checkUser(req,res,next){
    let token = req.headers.authorization
    
    if(token){
        token = token.split(" ")[1]
    }
    if(!token){
        return  res.status(401).json({message : "unauthorized"})
    }
    try{
        const user  = jwt.verify(token, JWT_SECRET)
        const final_user = await User.findById(user._id)
        if(!user){
            return res.json("Not Valid")
        }
        req.user = final_user
        next()

    }catch(err){
        return res.status(403).json({message : "jwt expired"})
    }
}
function generateToken(data){
    const token = jwt.sign(data,JWT_SECRET)
    return token
}

module.exports = {router,checkUser,refresh_token}