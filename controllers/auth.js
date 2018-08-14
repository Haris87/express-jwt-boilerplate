const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const hash = require("../helpers/hash");
const mailer = require("../helpers/mailer");
const HTTPException = require("./helpers/http-exception");

const router = express.Router();
require("dotenv").config();

/**
 * login user
 */
router.post("/login", loginUser);

/**
 * register new user
 */
router.post("/register", registrerUser);

/**
 * forgot password
 */
router.post("/forgot", forgotPassword);

/**
 * FUNCTIONS IMPLEMENTATION
 */

function loginUser(req, res, next) {
  const username = req.body.username;
  const password = hash(req.body.password);

  User.findOne({
    username: username,
    password: password
  })
    .then(user => {
      if (user) {
        const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
        res.send({ token: token });
      } else {
        throw new HTTPException(401, "Wrong credentials");
      }
    })
    .catch(next);
}

function registrerUser(req, res, next) {
  const user = new User();

  user.username = req.body.username;
  user.email = req.body.email;
  user.password = hash(req.body.password);
  user.createdAtUTC = new Date();

  user
    .save()
    .then(user => {
      // fetch user from db to hide private fields
      return User.findOne({ username: user.username });
    })
    .then(safeUser => {
      const token = jwt.sign({ user: safeUser }, process.env.JWT_SECRET);
      res.send({ token: token });
    })
    .catch(next);
}

function forgotPassword(req, res, next) {
  let password;
  User.findOne({ email: req.body.email })
    .select("+password")
    .then(user => {
      if (user === null) {
        throw {
          status: 404,
          error: "User with given email not found in database."
        };
      }

      // create new password
      password = hash(user.password);
      return User.findOneAndUpdate(
        { email: req.body.email },
        { password: hash(password) }
      );
    })
    .then(user => {
      const text =
        "Your new password is " +
        password +
        ". You should change it from your profile page as soon as you log in.";
      return mailer.sendEmail(user.email, "Reset Password", text, text);
    })
    .then(response => {
      res.send({ message: "Email sent." });
    })
    .catch(next);
}

module.exports = router;
