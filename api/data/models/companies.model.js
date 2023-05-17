const mongoose = require('mongoose');
const gameSchema = require('./games.model').gameSchema;

const companySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    yearFound:{
        type:Number,
        required:true
    },
    games:{
        type:[gameSchema],
        required:true
    }
});

const companyModel = mongoose.model(process.env.COMPANY_MODEL, companySchema, process.env.COMPANY_COLLECTION);
module.exports={
    companySchema,
    companyModel
};