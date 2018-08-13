const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

/* GET home page. */
router.get("/", getHome);

/**
 * FUNCTIONS IMPLEMENTATION
 */

function getHome(req, res, next) {
  // get version from package.json
  // pass it to cookie, so index.html can show it
  fs.readFile("package.json", (err, data) => {
    const project = JSON.parse(data.toString());
    res.cookie("version", project.version);
    res.cookie("name", project.name);

    res.sendFile(path.join(__dirname + "/../public/_index.html"));
  });
}

module.exports = router;
