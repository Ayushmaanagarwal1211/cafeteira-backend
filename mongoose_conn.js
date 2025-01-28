const mongoose = require("mongoose")
const dotenv = require("dotenv")
const MONGO_URI = process.env.MONGO_URI
mongoose.connect(MONGO_URI).then(()=>console.log("Connected")).catch((e)=>console.log("Error",e))