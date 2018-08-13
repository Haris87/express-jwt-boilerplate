const mongoose = require("mongoose");
const db = require("../helpers/db");

const Schema = mongoose.Schema;

// hides password, privateKey, kyc
const userSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, select: false, required: true },
    email: { type: String, unique: true, required: true },
    createdAtUTC: Date
  },
  { minimize: false }
);

db.errorHandler(userSchema);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
