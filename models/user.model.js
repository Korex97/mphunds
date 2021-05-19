const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
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
        required: true
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