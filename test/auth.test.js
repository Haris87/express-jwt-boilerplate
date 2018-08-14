const Mongoose = require("mongoose").Mongoose;
const mongoose = new Mongoose();

const Mockgoose = require("mockgoose").Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const should = chai.should();
require("dotenv").config();

const User = require("../models/user");
const server = require("../app");

chai.use(chaiHttp);
//Our parent block
describe("Auth", () => {
  before(done => {
    mockgoose
      .prepareStorage()
      .then(function() {
        //connect to db
        return mongoose.connect(process.env.CONNECTION_URL);
      })
      .then(connection => {
        // empty mock db
        return User.remove({});
      })
      .then(res => {
        done();
      });
  });

  const _user = {
    username: "test",
    email: "test@test.com",
    password: "test"
  };

  /*
  * User Resgistration
  */
  describe("/POST auth/register", () => {
    it("it should create new user", done => {
      let user = _user;
      chai
        .request(server)
        .post("/auth/register")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("token");
          done();
        });
    });
  });

  /*
  * User Login
  */
  describe("/POST auth/login", () => {
    it("it should login user", done => {
      let user = {
        username: _user.username,
        password: _user.password
      };

      chai
        .request(server)
        .post("/auth/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("token");
          done();
        });
    });
  });
});
