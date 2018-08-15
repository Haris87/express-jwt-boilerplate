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
  // Regex with positive look-ahead and look-behind to extract URL
  console.log(`${chalk.brightGreen('MongoDB')}: Successfully connected to ${connectionURL.match(/(?<=@).*(?=:)/g)}`);
}

const errorHandler = (schema) => {
  schema.post("save", (error, doc, next) => {
    if (error.name === "MongoError") {
      if (error.code === 11000) {
        const field = error.message.split(".$")[1].split("_1")[0];
        const value = error.message.split("{ : ")[1].split(" }")[0];
        next({
          status: 409,
          error: `An entry with ${field} ${value} already exists`
        });
        console.log(`${chalk.brightGreen('MongoDB')}: Error ${error.code} - An entry with ${field} ${value} already exists`);
      } else if (error.code === 6 || error.code === 7 || error.code === 89 || error.code === 9001) {
        next({
          status: 503,
          error: `Unable to reach database instance`
        });
        console.log(`${chalk.brightGreen('MongoDB')}: Error ${error.code} - Unable to reach MongoDB instance`);
      } else {
        next({
          status: 500,
          error: `Internal server error`
        });
        console.log(`${chalk.brightGreen('MongoDB')}: Error ${error.code} - Consult error_codes.err on mongodb's Github`);
      }
    } else {
      next();
    }
  });
}

module.exports = {
  connect: connect,
  errorHandler: errorHandler
}
