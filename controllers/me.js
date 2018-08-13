const express = require("express");
const User = require("../models/user");
const hash = require("../helpers/hash");
const router = express.Router();

/**
 * returns logged in user (with kyc info)
 */
router.get("/", getUser);

/**
 * update user profile
 */
router.put("/", updateUser);

/**
 * change password
 */
router.put("/password", changePassword);

/**
 * FUNCTIONS IMPLEMENTATION
 */

function getUser(req, res, next) {
  User.findOne({ username: req.user.username })
    .then(user => {
      return res.send(user);
    })
    .catch(next);
}

function updateUser(req, res, next) {
  let profile = {};
  profile.email = req.body.email || req.user.email;
  User.findOneAndUpdate({ username: req.user.username }, profile, {
    new: true
  })
    .then(user => {
      res.send(user);
    })
    .catch(next);
}

function changePassword(req, res, next) {
  User.findOne({
    username: req.user.username,
    password: hash(req.body.oldPassword)
  })
    .select("+password")
    .then(user => {
      if (user === null) {
        throw {
          status: 404,
          error: "Credentials incorrect. Check old password."
        };
      }

      return User.findOneAndUpdate(
        { hash: req.user.hash },
        { password: hash(req.body.newPassword) }
      );
    })
    .then(user => {
      res.send({ message: "Password updated successfully" });
    })
    .catch(next);
}

module.exports = router;
