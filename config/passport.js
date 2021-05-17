var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var User = require("../models/user.model");

module.exports = function(passport) {

    passport.use("local-login", new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true
    }, (email, password, done) => {
        User.findOne({ 'email': email}, (err, user) => {
            if (err) return done(err);
            console.log("user", user);
            console.log('password', password);

            if (!user){
                return done(null, false, {"message": "Email not registered"});
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: "Password Incorrect"})
                }

            })
        })
        .catch(err => console.log(err));
    
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser( function (id, done) {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    });
}