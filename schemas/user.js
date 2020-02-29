const mongoose = require('mongoose');


const LoginSchema = mongoose.Schema({
    username: {
        type: String,
        required: true

    },
    password:
    {
        type: String
    },
    cookies:
    {
        type: String,
        required: true
    },
    points: 
    {
        type: Number,
        default: 20,
        required: true
    }
})

module.exports = mongoose.model('User', LoginSchema);