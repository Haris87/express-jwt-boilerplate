const mongoose = require("mongoose");
const chalk = require("chalk");
require("dotenv").config();

const connectionURL = process.env.CONNECTION_URL;

const connect = () => {
  mongoose.connect(
    connectionURL,
    {
      useNewUrlParser: true,
      config: {
        autoIndex: true
      }
    }
  );
  // The substring essentially gets the actual URL of the DB
  console.log(`${chalk.green('MongoDB')}: Successfully connected to ${connectionURL.substring(connectionURL.indexOf('@') + 1, connectionURL.indexOf(':', connectionURL.indexOf('@')))}`);
}

const errorHandler = (schema) => {
  schema.post("save", (error, doc, next) => {
    if (error.name === "MongoError" && error.code === 11000) {
      const field = error.message.split(".$")[1].split("_1")[0];
      const value = error.message.split("{ : ")[1].split(" }")[0];
      console.log(`${chalk.green('MongoDB')}: Error ${error.code} - An entry with ${field} ${value} already exists.`);
      next({
        status: 409,
        error: `An entry with ${field} ${value} already exists.`
      });
    } else {
      next();
    }
  });
}

module.exports = {
  connect: connect,
  errorHandler: errorHandler
}
