const mongoose = require("mongoose")


const profileSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    inStock : {
        type : Boolean,
        default : true
    },
    counter : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "counters",
        required : true
    }
})

module.exports = mongoose.model("dishe" , profileSchema)