const mongoose = require("mongoose")

const counterSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    merchants : {
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }],
        default  : []
    },
    dishes : {
        type : [{type:mongoose.Schema.Types.ObjectId,ref : "dishe"}],
        default : []
    }
})

module.exports =  mongoose.model("counter",counterSchema)