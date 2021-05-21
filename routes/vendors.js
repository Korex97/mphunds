var express = require('express');
const emailValidator = require("email-deep-validator");
const bcrypt = require("bcrypt");
const { vendorAuthenticated } = require('../config/auth');
const vendorPassport = require("passport");
var vendorRouter = express.Router();
const emailValid = new emailValidator();

//Import Database Models
const User = require('../models/user.model');
const Vendor = require("../models/vendor.model");
const Coupon = require("../models/coupons.model");
const Withdraw = require("../models/withdrawal.model");



  
vendorRouter.get("/", (req, res) => {
    res.render("vendor-register");
})

// vendorRouter.get("/home", vendorAuthenticated ,(req, res) => {
//     res.json({username: req.vendor.username});
//     console.log(req.vendor);
// })
  
vendorRouter.get("/vendor-signup", (req, res) => {
    res.render("vendor-register");
});

//POST REQUESTS
  
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
                User.findOne({username: username})
                    .then( pple => {
                    if (pple) {
                        req.flash("signup_msg", "Username already taken");
                        res.redirect("/vendors/vendor-signup");
                    }else{
                        const newVendor = new User({
                          username: username,
                          email: email,
                          phone: phone,
                          password: password,
                          type: "vendor"
                        })
  
                        bcrypt.genSalt(10, (err, salt) => {
                          bcrypt.hash(newVendor.password, salt, (err, hash) => {
                              if (err) throw err;
                              newVendor.password = hash;
  
                              newVendor.save()
                                .then( vendor => {
                                  if ( vendor ) {
                                    req.flash("signup_msg", "You are now Registered, Kindly Login");
                                    res.redirect("/login");
                                  }
                                })
                          })
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

