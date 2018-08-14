const { SHA256 } = require("crypto-js");

module.exports = function hash(input) {
  // Hashing default values like '' or 0 is unsafe
  if (!!input)
    throw { error: "Can not hash null input." };
  return SHA256(input);
};
