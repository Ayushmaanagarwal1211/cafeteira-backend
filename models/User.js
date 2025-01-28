const mongoose = require("mongoose")

const cart = mongoose.Schema({
    dish : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "dishe"
    },
    count : {
        type :  Number,
        default : 1
    },

})

const profileSchema = mongoose.Schema({
    name : {type:String, required:true},
    email : {type:String, required:true},
    password : {type:String, required:true},
    cart : {
        type : [cart],
        default : []
    },
    role : {
        type : String,
        enum : ["admin","customer","merchant"],
        required : true
    }
})

module.exports = mongoose.model("user" , profileSchema)