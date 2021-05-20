var createError = require('http-errors');
var express = require('express');
var passport = require("passport");
var session = require("express-session");
var crypto = require("crypto");
// require("dotenv").config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Connect Mongodb to Application
var uri = "mongodb+srv://mphunds:mphunds@cluster0.bb9cp.mongodb.net/mphunds?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
var database = mongoose.connection;
database.on("error", console.error.bind(console, "Mongoose Connection Error"));
database.once('open', () => {
  console.log("MongoDB daatabase connection established successfully");
});

var app = express();

//Configuration
require("./config/passport")(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: crypto.randomBytes(20).toString("hex"),
  resave: true,
  saveUninitialized: false,
  cookie: {
    expires: 10800000, // 3 HRS
    httpOnly: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.signup_msg = req.flash('signup_msg');
  res.locals.login_msg = req.flash('login_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
