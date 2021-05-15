var express = require('express');
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
module.exports = router;
