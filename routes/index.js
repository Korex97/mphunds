var express = require('express');
const emailValidator = require("email-deep-validator");
const referralCodeGenerator = require('referral-code-generator');
var coupon_code = require('voucher-code-generator');
const bcrypt = require("bcrypt");
const passport = require("passport");
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
  if (req.user.type == "vendor"){
    res.render("vendor-home", {
      coupons: req.user.coupons
    });
  }else{
    res.render("profile", {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        referred: req.user.referred,
        bonus: req.user.referralBonus,
        refercode: req.user.refercode,
        balance: req.user.amountEarned,
        totalAmount: req.user.totalBalance,
        package: req.user.package 
    })
  }
});

router.get('/plan', function(req, res, next) {
  res.render('plan');
});

router.get('/coupon', ensureAuthenticated ,function(req, res, next) {
  User.find({type: "vendor"})
    .then(vendors => {
      if (vendors){
        res.render('coupon', {vendors});
      }
    })
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

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('login_msg', 'You are already logged Out');
  res.redirect('/login');
});

//Post Requests

router.post("/login", passport.authenticate("local-login",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}));

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
                            newUser.referredBy = value.email;
                            User.findOneAndUpdate({refercode: referral}, {
                              $push:{
                                referred: {
                                  username: username,
                                }
                            }
                            })
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
});

router.post("/generate", ensureAuthenticated, (req, res) => {
  const {package, ROI, price} = req.body;
  const user = req.user.username;

  var date = new Date();
  var year = date.getFullYear();
  var postfix = "-" + year.toString();
  const couponCode = coupon_code.generate({
    length: 10,
    count: 1,
    prefix: "MPHDS-",
    postfix: postfix,
    charset: coupon_code.charset("alphanumeric")
  });

  const newCoupon = new Coupon({
    couponCode: couponCode[0],
    package: package,
    roi: ROI,
    price: price
  });

  newCoupon.save()
    .then( coupon => {
      if (coupon) {
        User.findOneAndUpdate({username: user}, {
          $push:{
            coupons: {
                couponCode: couponCode[0],
                price: price,
                plan: package,
                roi: ROI
            }
          }
        }).then( updated => {
          if (updated) {
            res.redirect("/profile");
          }
        }).catch( err => res.json(err));
      }
    }).catch( err => res.json(err));
});
router.post("/coupon/delete", (req, res) => {
  var userId = req.body.userId;
  console.log(userId)
  User.findOne({_id: userId})
      .then( value => {
          if (value) {
              console.log(value);
          }
      })
});
module.exports = router
