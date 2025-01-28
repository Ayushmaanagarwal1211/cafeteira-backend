const dotenv = require('dotenv');
dotenv.config();
require('./mongoose_conn');
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const {cartRouter} = require('./routes/cart.js')
const {userRouter} = require("./routes/user.js")
const {router,checkUser} = require("./auth/authentication.js");
const {orderRouter} = require("./routes/order.js")
const cors = require("cors")
app.use(cors())
app.use(express.json());




app.use("/cart",checkUser, cartRouter)
app.use('/user',checkUser,userRouter)
app.use('/auth',router)
app.use("/order",checkUser,orderRouter)
app.listen(PORT);
