const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true
    }, 
    package: {
        type: String
    },
    price: {
        type: Number
    },
    roi: {
        type: Number
    },
    used: {
        type: String
    }
});

couponSchema.index( 
    { creationDate: 1 }, 
    { expireAfterSeconds: 2592000 }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;