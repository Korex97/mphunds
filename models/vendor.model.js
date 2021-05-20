const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
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
    phone: {
        type: Number,
        required: true
    },
    coupons: [{
        couponCode: String,
        price: Number,
        plan: String,
        roi: Number
    }]
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;