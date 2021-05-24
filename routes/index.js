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
var fieSystem = require("fs");
var fastcsv = require("fast-csv");

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
    if(req.user.type == "admin"){
      res.redirect("/admin-home")
    }else{
      var date = new Date();
      var current = date.getTime();
      var expires = req.user.expires;
      var msInDay = 1000 * 3600 * 24;
      var difference = Math.floor((expires - current) / msInDay);

      if (Number.isNaN(difference) == true){
        res.render("profile", {
          username: req.user.username,
          firstname: req.user.firstname,
          lastname: req.user.lastname,
          email: req.user.email,
          referred: req.user.referred,
          bonus: req.user.referralBonus,
          refercode: req.user.refercode,
          balance: req.user.amountEarned,
          roi: req.user.roi,
          totalAmount: req.user.totalBalance,
          package: req.user.package,
          days: "Fund Your Account"
        })
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
          roi: req.user.roi,
          totalAmount: req.user.totalBalance,
          package: req.user.package,
          days: difference
        })
      }
    }
  }
})

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
  var date = new Date();
  var current = date.getTime();
  var expires = req.user.expires;
  var msInDay = 1000 * 3600 * 24;
  var difference = Math.floor((expires - current) / msInDay);
  if (Number.isNaN(difference) == true){
    req.flash('login_msg', 'You Need To fund Your Acoount Before You can Withdraw');
    res.redirect('/profile');
  }
  if( difference > 0 || difference == 0 ){
    const message = difference.toString() + "Days Left Be Before You Can Withdraw"
    req.flash('login_msg', message);
    res.redirect('/profile');
  }else{
    res.render('withdraw');
  }
  
});

router.get('/tos', function(req, res, next) {
  res.render('tos');
});
// router.get('/admin-home', ensureAuthenticated ,function(req, res, next) {
  
// });
router.get("/admin-register", (req, res) => {
  res.render("admin-register");
})
router.get("/admin-home", ensureAuthenticated, (req, res) => {
  User.find()
        .then(users => {
            if (users){
                Withdraw.find()
                    .then( withdraw => {
                        if (withdraw){
                            res.render('admin-home', {
                                users: users,
                                withdraw: withdraw
                            })
                        }
                    })
            }
      })
})
router.get("/vendor/:userId", ensureAuthenticated, (req, res) => {
  var userId = req.params.userId;
  User.findOne({_id: userId})
      .then( value => res.render("admin-edit", {user: value}))
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
router.post("/user/delete", ensureAuthenticated, (req, res) => {
  var userId = req.body.userId;
  User.findOneAndDelete({_id: userId})
      .then( value => {
          if (value) {
              res.redirect("/profile");
          }
      })
});
router.post("/vendor/:userId", ensureAuthenticated, (req, res) => {
  var userId = req.params.userId;
  var username = req.body.username;
  var email = req.body.email;
  var phone = req.body.phone;

  User.findOneAndUpdate({_id: userId}, {
    $set:{
      username: username,
      email: email,
      phone: phone
    }
  }).then( value => {
    if (value){
      req.flash('login_msg', 'Vendor Profile Successfully Updated');
      res.redirect('/profile');
    }
  })
});

router.post("/pay", ensureAuthenticated ,(req, res) => {
  var userId = req.body.userId;

  Withdraw.findOne({_id: userId})
      .then(value => {
          if (value) {
              if (value.paid == "yes"){
                  res.redirect("/profile");
              }else{
                  value.update({
                      $set: {paid: "yes"}
                  }).then( pay => res.redirect("/profile"));
              }
          }
      })
      .catch( err => res.json(err));
});

router.get("/exportcsv", ensureAuthenticated ,(req, res) => {
  var data = [];

  Withdraw.find({paid: "no"})
      .then( value => {
          if (value.length > 0){
              
              for (var i = 0; i < value.length; i++) {
                  data.push([
                      value[i].accountName,
                      value[i].bank,
                      value[i].accountNumber,
                      value[i].amount
                  ])
              }
              Withdraw.deleteMany({paid: "no"})
                  .then( success => {
                      var ws = fieSystem.createWriteStream("public/data.csv");
                      fastcsv
                          .write(data, {headers: ["Account Name", "Bank", "Account Number", "Amount"]})
                          .on("finish", function() {
                              res.send("<a href='/data.csv' download= 'data.csv' id='download-link'></a><script>document.getElementById('download-link').click();</script>")
                          })
                          .pipe(ws);
                  })
          }else{
            req.flash('login_msg', 'No Entry on withdrawal list');
            res.redirect('/profile');
          }
      });
});

router.post("/login", passport.authenticate("local-login",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}));

router.post("/activate", ensureAuthenticated, (req, res) => {
  const coupon = req.body.coupon;
  const referred = req.user.referredBy;
  var date = new Date();
  var future = date.setDate(date.getDate() + 30);

  Coupon.findOne({couponCode: coupon})
    .then( verified => {
      if (verified){
        if (verified.used == "yes"){
          req.flash('login_msg', 'Coupon Has Already Been Used');
          res.redirect('/profile');
        }else{
            const bonus = 0.15 * verified.price;
            const funded = verified.price;
            const roi = verified.roi;
            const package = verified.package;
            const act = req.user.activated;
            if (act == "yes"){
              User.findOneAndUpdate({username: req.user.username}, {
                    $set: {
                      activated: "yes",
                      package: package,
                      expires: future
                    },
                    $inc: {
                      'amountEarned': funded,
                      "roi": roi,
                      'totalBalance': roi          
                    }
                  }).then( active => {
                    if (active){
                      Coupon.findOneAndUpdate({couponCode: coupon}, {
                        $set: {
                          used: "yes"
                        }
                      }).then( use => {
                        if (use){
                          req.flash("signup_msg", "Acount Succesfully Funded");
                          res.redirect("/profile");
                        }
                      })
                    }
                  })
            } else {
              User.findOneAndUpdate({email: referred}, {
                $inc:{
                    "referralBonus": bonus,
                    "totalBalance": bonus
                }
              }).then( refer => {
                  if (refer){
                    User.findOneAndUpdate({username: req.user.username}, {
                      $set: {
                        activated: "yes",
                        package: package,
                        expires: future
                      },
                      $inc: {
                        'amountEarned': funded,
                        "roi": roi,
                        'totalBalance': roi          
                      }
                    }).then( active => {
                      if (active){
                        Coupon.findOneAndUpdate({couponCode: coupon}, {
                          $set: {
                            used: "yes"
                          }
                        }).then( use => {
                          if (use){
                            req.flash("signup_msg", "Acount Succesfully Funded");
                            res.redirect("/profile");
                          }
                        })
                      }
                    })
                  } else {
                    User.findOneAndUpdate({username: req.user.username}, {
                      $set: {
                        activated: "yes",
                        package: package,
                        expires: future
                      },
                      $inc: {
                        'amountEarned': funded,
                        "roi": roi,
                        'totalBalance': roi          
                      }
                    }).then( active => {
                      if (active){
                        Coupon.findOneAndUpdate({couponCode: coupon}, {
                          $set: {
                            used: "yes"
                          }
                        }).then( use => {
                          if (use){
                            req.flash("signup_msg", "Acount Succesfully Funded");
                            res.redirect("/profile");
                          }
                        })
                      }
                    })
                  }
              })
            }
        }
      } else{
        req.flash('login_msg', 'Invalid Coupon, Coupon is Case-Sensitive');
        res.redirect('/profile');
      }
    })
});

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
                    refercode: code,
                    roi: 0,
                    referralBonus: 0,
                    amountEarned: 0,
                    totalBalance: 0
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
router.post("/withdraw", ensureAuthenticated, (req, res) => {
  var username = req.user.username;
  var accountName = req.body.accountName;
  var bankName = req.body.bankName;
  var accountNumber = req.body.accountNumber;
  var amount = req.body.amount;
  var remaining;
  let errors = [];

  User.findOne({username: username})
      .then( value => {
          if (value){
              var TotalBalance = value.totalBalance;
              if (amount <= TotalBalance) {
                  remaining = TotalBalance - amount;
                  value.update({
                      $set: {
                          "totalBalance": remaining
                      }
                  }).then( withdraw => {
                      if (withdraw){
                          const newWithdrawal = new Withdraw({
                              username: username,
                              accountName: accountName,
                              bank: bankName,
                              accountNumber: accountNumber,
                              amount: amount,
                              balance: remaining
                          });
                      
                          newWithdrawal.save()
                              .then(withdraw => {
                                  if (withdraw){
                                      req.flash(`login_msg`, 'Withdrawal Successfully Requested');
                                      res.redirect('/withdraw');
                                  }
                              })
                              .catch(err => console.log(err));
                      }
                  })
              }
              else{
                  req.flash(`login_msg`, 'Insufficient Funds');
                  res.redirect('/withdraw');
              }
          }
      })
});
router.post("/admin-signup", (req, res) => {
  const {username, password, confirmPassword } = req.body;

  if (password.length < 6){
    req.flash("signup_msg", "Password Must be More than 6 characters");
    res.redirect("/admin-register");
  }
  
  if ( password == confirmPassword) {
      const newAdmin = new User({
          email: username,
          password: password,
          type: "admin"
      })

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
          if (err) throw err;
            newAdmin.password = hash;

              newAdmin.save()
                .then( vendor => {
                  if ( vendor ) {
                      req.flash("signup_msg", "You are now Registered, Kindly Login");
                      res.redirect("/login");
                  }
                })
        })
      })
  } else {
    req.flash("signup_msg", "Password Doesn't Match");
    res.redirect("/admin-register");
  }

})
router.post("/coupon/delete", (req, res) => {
  var userId = req.body.userId;
  var id = req.user._id;
  console.log(userId, id);

  User.findByIdAndUpdate(id, {
    $pull: {
      "coupons": {_id: userId}
    }
  },{safe: true, upsert: true}).then( pulled => {
    if (pulled) {
      req.flash("signup_msg", "Coupon Successfully Deleted");
      res.redirect("/profile")
    }
  })
});

// router.get("/all", ensureAuthenticated ,(req, res) => {
//   User.findById(req.user.coupons[0]._id)
//     .then( user => res.json(user));

// })
module.exports = router
