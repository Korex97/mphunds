var express = require('express');
const emailValidator = require("email-deep-validator");
const referralCodeGenerator = require('referral-code-generator');
const bcrypt = require("bcrypt");
const passport = require('passport');
const { vendorAuthenticated } = require('../config/auth');
var vendorRouter = express.Router();
const emailValid = new emailValidator();

//Import Database Models
const User = require('../models/user.model');
const Vendor = require("../models/vendor.model");
const Coupon = require("../models/coupons.model");
const Withdraw = require("../models/withdrawal.model");

vendorRouter.get("/vendor-login", (req, res) => {
    res.render("vendor-login");
});
  
vendorRouter.get("/", (req, res) => {
    res.render("vendor-login");
})

vendorRouter.get("/home", (req, res) => {
    res.json(req.user);
})
  
vendorRouter.get("/vendor-logout", (req, res) => {
    req.logout();
    req.flash('login_msg', 'You are already logged Out');
    res.redirect('/vendors/vendor-login');
})
  
vendorRouter.get("/vendor-signup", (req, res) => {
    res.render("vendor-register");
});

//POST REQUESTS

vendorRouter.post("/vendor-login", passport.authenticate("local-vendor", {
    successRedirect: "/vendors/home",
    failureRedirect: "/vendors/vendor-login",
    failureFlash: true
}))
  
vendorRouter.post("/vendor-signup", (req, res) => {
    const {username, email, phone, password, confirmPassword } = req.body;
  
    if (password.length < 6){
      req.flash("signup_msg", "Password Must be More than 6 characters");
      res.redirect("/vendors/vendor-signup");
    }
  
    if ( phone.length < 11 || phone.length > 11){
      req.flash("signup_msg", "Phone Number is incorrect");
      res.redirect("/vendors/vendor-signup");
    }
    
    if ( password == confirmPassword) {
      User.findOne({email: email})
        .then( user => {
          if (user){
            req.flash("signup_msg", "You can't be a User and a Vendor");
            res.redirect("/vendors/vendor-signup");
          }else{
            Vendor.findOne({email: email})
              .then( emails => {
                if (emails) {
                  req.flash("signup_msg", "Email already exists");
                  res.redirect("/vendors/vendor-signup");
                } else {
                  Vendor.findOne({username: username})
                    .then( pple => {
                      if (pple) {
                        req.flash("signup_msg", "Username already taken");
                        res.redirect("/vendors/vendor-signup");
                      }else{
                        const newVendor = new Vendor({
                          username: username,
                          email: email,
                          phone: phone,
                          password: password
                        })
  
                        bcrypt.genSalt(10, (err, salt) => {
                          bcrypt.hash(newVendor.password, salt, (err, hash) => {
                              if (err) throw err;
                              newVendor.password = hash;
  
                              newVendor.save()
                                .then( vendor => {
                                  if ( vendor ) {
                                    req.flash("signup_msg", "You are now Registered, Kindly Login");
                                    res.redirect("/vendors");
                                  }
                                })
                          })
                        })
                      }
                    })
                }
              })
          }
        })
  
    } else {
      req.flash("signup_msg", "Password Doesn't Match");
      res.redirect("/vendors/vendor-signup");
    }
  
})


module.exports = vendorRouter;

