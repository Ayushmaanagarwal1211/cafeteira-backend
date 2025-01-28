const mongoose = require("mongoose")
const orderDetails = mongoose.Schema({
    dish : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "dishe"
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    quantity : {
        type:Number,
        default :0
    },
    counter : {
        type:mongoose.Schema.Types.ObjectId,
        ref : "counter"
    },
    completed : {
        type : Boolean,
        default :  false
    },
    date : {
        type : Date,
        default : Date.now
    }
})


module.exports =  mongoose.model("order",orderDetails)