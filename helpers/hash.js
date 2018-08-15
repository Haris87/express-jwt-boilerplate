const { SHA256 } = require("crypto-js");

module.exports = (input) => {
  // Hashing default values like '' or 0 is unsafe
  if (!!input)
    throw { error: "Can not hash undefined / null / empty input." };
  return SHA256(input);
};
