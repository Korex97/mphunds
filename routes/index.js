var express = require('express');
const emailValidator = require("email-deep-validator");
const referralCodeGenerator = require('referral-code-generator');
const bcrypt = require("bcrypt");
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const { vendorAuthenticated } = require('../config/auth');
var router = express.Router();
const emailValid = new emailValidator();

//Import Database Models
const User = require('../models/user.model');
const Vendor = require("../models/vendor.model");
const Coupon = require("../models/coupons.model");
const Withdraw = require("../models/withdrawal.model");



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});

router.get('/profile', ensureAuthenticated, function(req, res, next) {
  res.render('profile');
});

router.get('/plan', function(req, res, next) {
  res.render('plan');
});

router.get('/coupon', ensureAuthenticated ,function(req, res, next) {
  res.render('coupon');
});

router.get('/gen-income', function(req, res, next) {
  res.render('gen-income');
});

router.get('/withdraw', ensureAuthenticated , function(req, res, next) {
  res.render('withdraw');
});

router.get('/tos', function(req, res, next) {
  res.render('tos');
});

router.get("/vendor-login", (req, res) => {
  res.render("vendor-login");
});

router.get("/vendor-home", vendorAuthenticated ,(req, res) => {
  res.render("vendor-home");
})

router.get("/vendor-logout", (req, res) => {
  req.logout();
  req.flash('login_msg', 'You are already logged Out');
  res.redirect('/vendor-login');
})

router.get("/vendor-signup", (req, res) => {
  res.render("vendor-register");
});

router.get('/signup', function(req, res, next) {
  res.render('signin', {code: ""});
});

router.get("/signup/:codes", (req, res) => {
  var codes = req.params.codes;
  User.findOne({refercode: codes})
    .then(user => {
      if (user){
        var code = user.refercode;
        res.render("signin", {code: code});
      }
    })
})

router.get('/login', function(req, res, next) {
  
  res.render('login');
});

//Post Requests

router.post("/login", passport.authenticate("local-login", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}));

router.post("/vendor-login", passport.authenticate("local-vendor", {
  successRedirect: "/vendor-home",
  failureRedirect: "/vendor-login",
  failureFlash: true
}))

router.post("/vendor-signup", (req, res) => {
  const {username, email, phone, password, confirmPassword } = req.body;

  if (password.length < 6){
    req.flash("signup_msg", "Password Must be More than 6 characters");
    res.redirect("/vendor-signup")
  }

  if ( phone.length < 11 || phone.length > 11){
    req.flash("signup_msg", "Phone Number is incorrect");
    res.redirect("/vendor-signup");
  }
  
  if ( password == confirmPassword) {
    User.findOne({email: email})
      .then( user => {
        if (user){
          req.flash("signup_msg", "You can't be a User and a Vendor");
          res.redirect("/vendor-signup")
        }else{
          Vendor.findOne({email: email})
            .then( emails => {
              if (emails) {
                req.flash("signup_msg", "Email already exists");
                res.redirect("/vendor-signup")
              } else {
                Vendor.findOne({username: username})
                  .then( pple => {
                    if (pple) {
                      req.flash("signup_msg", "Username already taken");
                      res.redirect("/vendor-signup")
                    }else{
                      const newVendor = new Vendor({
                        username: username,
                        email: email,
                        phone: phone,
                        password: password
                      })

                      bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newVendor.password = hash;

                            newVendor.save()
                              .then( vendor => {
                                if ( vendor ) {
                                  req.flash("signup_msg", "You are now Registered, Kindly Login");
                                  res.redirect("/vendor-login")
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
    res.redirect("/vendor-signup")
  }

})

router.post("/signup", (req, res) => {
  const {firstname, lastname, password, referral, confirmPassword ,username, email} = req.body;
  
  if (password.length < 6){
    req.flash("signup_msg", "Password Must be More than 6 characters");
    res.redirect("/signup")
  }
  if ( password == confirmPassword) {
    // res.json({firstname, lastname, password, referral, confirmPassword ,username, email})
    User.findOne({email: email})
      .then( user => {
        if (user){
          req.flash("signup_msg", "Email is already Registered");
          res.redirect("/signup")
        }else{
          User.findOne({username: username})
            .then( available => {
              if (available) {
                req.flash("signup_msg", "Username is already taken");
                res.redirect("/signup")
              }else{
                var code = referralCodeGenerator.alphaNumeric('lowercase', 3, 3, username);
                const newUser = new User({
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    email: email,
                    password: password,
                    refercode: code
                });

                User.findOne({refercode: referral})
                    .then(value => {
                        if (value){
                            newUser.referredBy = value.email
                        }
                    })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;

                        newUser.save()
                            .then(user => {
                                if (user){
                                    console.log(user);
                                    req.flash(`signup_msg`, 'You are now Registered and can login');
                                    res.redirect('/login');
                                }
                              })
                            .catch( err => console.log(err));
                      })
                  })
                }
            })
          }
      })

  }else{
    req.flash("signup_msg", "Password Does Not Match");
    res.redirect("/signup");
  }
})
module.exports = router;
