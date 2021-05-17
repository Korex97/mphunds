var express = require('express');
const User = require('../models/user.model');
const emailValidator = require("email-deep-validator");
const referralCodeGenerator = require('referral-code-generator');
const bcrypt = require("bcrypt");
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
var router = express.Router();
const emailValid = new emailValidator();



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});

router.get('/profile', function(req, res, next) {
  res.render('profile');
});

router.get('/plan', function(req, res, next) {
  res.render('plan');
});

router.get('/coupon', function(req, res, next) {
  res.render('coupon');
});

router.get('/gen-income', function(req, res, next) {
  res.render('gen-income');
});

router.get('/withdraw', function(req, res, next) {
  res.render('withdraw');
});

router.get('/tos', function(req, res, next) {
  res.render('tos');
});

router.get('/signup', function(req, res, next) {
  req.flash("Signup_Message", "Please Fill in your details")
  res.render('signin');
});

router.get('/login', function(req, res, next) {
  
  res.render('login');
});

//Post Requests

router.post("/login", (req, res) => {
  passport.authenticate("local-login", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  })
})

router.post("/signup", (req, res) => {
  const {firstname, lastname, password, referral, confirmPassword ,username, email} = req.body;
  
  if (firstname || lastname || password || confirmPassword || email || username) {
    res.json("Please Fill in all Fields")
  }
  if (password.length < 6){
    // req.flash("Signup_Message", "Password Must be More than 6 characters");
    res.json("password is not up to 6 characters")
  }
  if ( password == confirmPassword) {
    res.json({firstname, lastname, password, referral, confirmPassword ,username, email})
    // User.findOne({email: email})
    //   .then( user => {
    //     if (user){
    //       req.flash("Signup Message", "Email is already Registered");
    //       req.render("signin");
    //     }else{
    //       var code = referralCodeGenerator.alphaNumeric('lowercase', 3, 3, username);
    //       const newUser = new User({
    //         firstname: firstname,
    //         lastname: lastname,
    //         username: username,
    //         email: email,
    //         password: password,
    //         refercode: code
    //       });

    //       User.findOne({refercode: referral})
    //           .then(value => {
    //             if (value){
    //               newUser.referred = value.email
    //             }
    //           })

    //       bcrypt.genSalt(10, (err, salt) => {
    //         bcrypt.hash(newUser.password, salt, (err, hash) => {
    //           if (err) throw err;
    //           newUser.password = hash;

    //           newUser.save()
    //             .then(user => {
    //               if (user){
    //                 console.log(user);
    //                 req.flash(`Signup Message`, 'You are now Registered and can login');
    //                 res.redirect('/login');
    //               }
    //             })
    //             .catch( err => console.log(err));
    //         })
    //       })
    //     }
    //   })

  }else{
      res.json("Password Does Not Match")
    // req.flash("Signup_Message", "Password Does Not Match");
    // res.redirect("/signup");
  }
})
module.exports = router;
