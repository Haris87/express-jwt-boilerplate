const mongoose = require("mongoose");
require("dotenv").config();

const connectionURL = process.env.CONNECTION_URL;

function connect() {
  mongoose.connect(
    connectionURL,
    {
      useNewUrlParser: true,
      config: {
        autoIndex: true
      }
    }
  );

  console.log("db connected.");
}

function errorHandler(schema) {
  schema.post("save", (error, doc, next) => {
    if (error.name === "MongoError" && error.code === 11000) {
      const field = error.message.split(".$")[1].split("_1")[0];
      const value = error.message.split("{ : ")[1].split(" }")[0];
      next({
        status: 409,
        error: "An entry with " + field + " " + value + " already exists."
      });
    } else {
      next();
    }
  });
}

const db = {
  connect: connect,
  errorHandler: errorHandler
};

module.exports = db;
