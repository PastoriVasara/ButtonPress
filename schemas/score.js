const mongoose = require('mongoose');


const ScoreSchema = mongoose.Schema({
    points: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model('Score', ScoreSchema);