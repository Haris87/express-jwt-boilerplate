const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const jwt = require("./middlewares/jwt");

const db = require("./helpers/db");
const HTTPException = require("./helpers/http-exception");

const index = require("./controllers/index");
const auth = require("./controllers/auth");
const users = require("./controllers/users");
const me = require("./controllers/me");

const app = express();
db.connect();

// enable cors
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(__dirname + "/public"));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/auth", auth);

// restricted access routes
app.use("/me", jwt, me);
app.use("/users", jwt, users); // route for testing only, should be removed after real deployment

// swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  throw new HTTPException(404, "Route not found");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // respond with error
  res.status(err.status || 500).send(err);
});

module.exports = app;
