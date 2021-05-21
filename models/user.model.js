const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refercode: {
        type: String,
    },
    referredBy: {
        type: String
    },
    referred:[{
        username: String
    }],
    referralBonus:{
        type: Number
    },
    phone: {
        type: Number,
    },
    coupons: [{
        couponCode: String,
        price: Number,
        plan: String,
        roi: Number
    }],
    type:{
        type: String
    },
    amountEarned: {
        type: Number
    },
    totalBalance: {
        type: Number
    },
    activated:{
        type: String
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;