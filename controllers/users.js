const express = require("express");
const User = require("../models/user");
const hash = require("../helpers/hash");
const router = express.Router();

/**
 * get all approved users
 */
router.get("/", getUsers);

/**
 * FUNCTIONS IMPLEMENTATION
 */

function getUsers(req, res, next) {
  User.find({})
    .then(users => {
      res.send(users);
    })
    .catch(next);
}

module.exports = router;
