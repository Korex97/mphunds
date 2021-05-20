const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    accountNumber: {
        type: Number,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    bank: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    paid: {
        type: String
    },
    balance: {
        type: String
    }
});

const Withdraw = mongoose.model('Withdraw', withdrawSchema);

module.exports = Withdraw;