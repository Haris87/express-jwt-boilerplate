const { SHA256 } = require("crypto-js");

module.exports = (input) => {
  // Hashing default values like '' or 0 is unsafe
  if (!!input) {
    return SHA256(input).toString();
  }
  throw { error: "Can not hash undefined / null / empty input." };
};
