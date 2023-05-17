const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    yearReleased: {
        type: Number,
        required: true
    },
    platforms: {
        type: [String],
        required: true
    }
});

module.exports = {
    gameSchema
};