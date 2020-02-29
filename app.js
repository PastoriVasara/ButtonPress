const Express = require("express");
const BodyParser = require("body-parser");
const Mongoose = require("mongoose");
var cookieParser = require('cookie-parser');
var cors = require('cors');
const userRoute = require('./routes/user');
require('dotenv/config');


var app = Express();
app.use(cors());
app.use(BodyParser.json());
app.use(cookieParser());
app.use('/users',userRoute);



//hide
Mongoose.connect(process.env.DB_CONNECTION, {useNewUrlParser: true}, () => console.log("connected to DB"));



app.listen(8000,'167.71.34.29');