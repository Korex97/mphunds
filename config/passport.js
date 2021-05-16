var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var User = require("../models/user.model");

module.exports = function(passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser( function (id, done) {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    });

    passport.use("local-login", new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        User.findOne({ 'email': email}, (err, user) => {
            if (err) return done(err);
            console.log("user", user);
            console.log('password', password);

            if (!user){
                return done(null, false, req.flash("message", "Email not registered"));
            }
            if (!user.validPassword(password))
                return done(
                    null,
                    false,
                    req.flash("message", "Wrong Password")
                )
            return done(null, user)
        })
    
    }
    ))
}