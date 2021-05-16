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
    referred: {
        type: String
    },
    activated:{
        type: String
    }
});


userSchema.methods.validPassword = (password) => {
    return bcrypt.compareSync(password, this.password, );
}

const User = mongoose.model('User', userSchema);

module.exports = User;