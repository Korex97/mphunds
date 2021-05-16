var express = require('express');
const User = require('../models/user.model');
const validator = require("email-validator");
const referralCodeGenerator = require('referral-code-generator');
const bcrypt = require("bcrypt");
const passport = require('passport');
var router = express.Router();

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
  const validate = validator(email);
  
  if (firstname || lastname || password || confirmPassword || email || username) {
    req.flash("Signup_Message", "Please Fill Out All Fields");
    res.redirect("/signup")
    
  }
  if (password.length < 6){
    req.flash("Signup_Message", "Password Must be More than 6 characters");
    res.redirect("/signup");
  }
  if ( password == confirmPassword) {
    req.flash("Signup_Message", "Password Does Not Match")
    res.redirect("/signup")
  } 
  if (validate == false){
    req.flash("Signup_Message", "Please Enter a Valid Email")
    res.redirect("/signup")
  }else {
    User.findOne({email: email})
      .then( user => {
        if (user){
          req.flash("Signup Message", "Email is already Registered");
          req.render("signin");
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
                  newUser.referred = value.email
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
                    req.flash(`Signup Message`, 'You are now Registered and can login');
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
module.exports = router;
