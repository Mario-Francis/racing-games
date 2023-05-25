const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});

const userModel = mongoose.model(process.env.USER_MODEL, userSchema, process.env.USER_COLLECTION);

module.exports = {
    userSchema,
    userModel
};