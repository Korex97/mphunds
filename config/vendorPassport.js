var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var Vendor = require("../models/vendor.model");

module.exports = function(passport) {
    passport.use("local-vendor", new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        Vendor.findOne({'email': email}, (err, vendor) => {
            if (err) throw done(err);

            console.log("user", vendor);
            console.log('password', password);

            if (!vendor){
                return done(null, false, req.flash('login_msg', "Email is not registered, please kindly register as a vendor"));
            }
            bcrypt.compare(password, vendor.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch){
                    return done(null,true,vendor)
                }else{
                    return done(null, false, req.flash('login_msg', "Password is Incorrect"))
                }
            })
        })
        .catch(err => console.log(err));
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser( function (id, done) {
        Vendor.findById(id, (err, user) => {
            done(err, user);
        })
    });
}