const mongoose = require("mockgoose");
const User = require("../models/user");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");
const faker = require("faker");
const should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe("Auth", () => {
  // beforeEach(done => {
  //   //Before each test we empty the database
  //   User.find({}, err => {
  //     done();
  //   });
  // });

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
