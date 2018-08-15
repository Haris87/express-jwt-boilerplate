const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const hash = require("../helpers/hash");
const mailer = require("../helpers/mailer");
const HTTPException = require("../helpers/http-exception");

const RateLimit = require("express-rate-limit");

const loginLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 10, // start blocking after 10 requests
  message: "Too many login attempts, please try again after an hour"
});

const registerLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  delayAfter: 1, // begin slowing down responses after the first request
  delayMs: 3*1000, // slow down subsequent responses by 3 seconds per request
  max: 5, // start blocking after 5 requests
  message: "Too many accounts created, please try again after an hour"
});

const resetLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 2, // start blocking after 2 requests
  message: "Too many password resets requested, please try again after an hour"
});

const router = express.Router();
require("dotenv").config();

/**
 * login user
 */
router.post("/login", loginLimiter, loginUser);

/**
 * register new user
 */
router.post("/register", registerLimiter, registerUser);

/**
 * forgot password
 */
router.post("/forgot", resetLimiter, forgotPassword);

/**
 * FUNCTIONS IMPLEMENTATION
 */

function sanitizeInput(request, requiredParams) {
  const sanitizedRequest = new Object();
  requiredParams.forEach((key) => {
    sanitizedRequest[key] = request[key];
    if (request[key] === undefined) {
      throw new HTTPException(401, "Invalid Credentials");
    }
    if (key === 'username') {
      // GitHub Regex for usernames
      if (!request[key].match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)) {
        throw new HTTPException(401, "Invalid Credentials");
      }
    } else if (key === 'password') {
      sanitizedRequest[key] = hash(sanitizedRequest[key]);
    } else if (key === 'email') {
      // Email Regex of HTML5 Spec: https://www.w3.org/TR/html5/forms.html#valid-e-mail-address
      if (!request[key].match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
        throw new HTTPException(401, "Invalid Credentials");
      }
    }
  });
  return sanitizedRequest;
}

function loginUser(req, res, next) {
  req.body = sanitizeInput(req.body, ['username', 'password']);

  const { username, password } = req.body;

  User.findOne({
    username: username,
    password: password
  })
    .then(user => {
      if (user) {
        const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
        res.send({ token: token });
      } else {
        throw new HTTPException(401, "Invalid Credentials");
      }
    })
    .catch((err) => {

    });
}

function registerUser(req, res, next) {
  req.body = sanitizeInput(req.body, ['username', 'password', 'email']);

  const user = new User(req.body);

  user.createdAtUTC = new Date();

  user
    .save()
    .then(user => {
      // Delete private field
      delete user.password;
      const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
      res.send({ token: token });
    })
    .catch(next);
}

function forgotPassword(req, res, next) {
  req.body = sanitizeInput(req.body, ['email']);

  User.findOne({ email: req.body.email })
    .select("+password")
    .then(user => {
      if (user === null) {
        throw new HTTPException(404, "User with given email not found in database");
      }

      // create new password
      this.password = hash(user.password);
      return User.findOneAndUpdate(
        { email: req.body.email },
        { password: hash(password) }
      );
    })
    .then(user => {
      const text =
        "Your new password is " +
        this.password +
        ". You should change it from your profile page as soon as you log in.";
      delete this.password;
      return mailer.sendEmail(user.email, "Reset Password", text, text);
    })
    .then(response => {
      res.send({ message: "Email sent." });
    })
    .catch(next);
}

module.exports = router;
