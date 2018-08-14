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

const _user = {
  username: "test",
  password: "test"
};

let _token;

//Our parent block
describe("Users", () => {
  before(function(done) {
    mockgoose
      .prepareStorage()
      .then(function() {
        //connect to db
        return mongoose.connect(process.env.CONNECTION_URL);
      })
      .then(connection => {
        // login with user
        return chai
          .request(server)
          .post("/auth/login")
          .send(_user);
      })
      .then(res => {
        // retrieve and save token
        _token = res.body.token;
        done();
      });
  });

  /*
  * Get logged in User - Authorized
  */
  describe("/GET me", () => {
    it("it should retrieve logged in user", done => {
      chai
        .request(server)
        .get("/me")
        .set("Authorization", "Bearer " + _token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("username");
          done();
        });
    });
  });

  /*
  * Get logged in User - Unauthorized
  */
  describe("/GET me", () => {
    it("it should throw 401 error when no token provided", done => {
      chai
        .request(server)
        .get("/me")
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a("object");
          res.body.should.have.property("error");
          done();
        });
    });
  });

  /*
  * Update user profile info - Authorized
  */
  describe("/PUT me", () => {
    it("it should update user profile", done => {
      const request = {
        email: faker.internet.email()
      };

      chai
        .request(server)
        .put("/me")
        .set("Authorization", "Bearer " + _token)
        .send(request)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    });
  });

  /*
  * Update user profile info - Unauthorized
  */
  describe("/PUT me", () => {
    it("it should throw 401 error when no token provided", done => {
      const request = {
        email: faker.internet.email()
      };

      chai
        .request(server)
        .put("/me")
        .send(request)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a("object");
          res.body.should.have.property("error");
          done();
        });
    });
  });

  /*
  * Update user password - Authorized
  */
  describe("/PUT me/password", () => {
    it("it should update user password", done => {
      const request = {
        oldPassword: _user.password,
        newPassword: faker.hacker.phrase()
      };

      chai
        .request(server)
        .put("/me/password")
        .set("Authorization", "Bearer " + _token)
        .send(request)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    });
  });

  /*
  * Update user password - Unauthorized
  */
  describe("/PUT me/password", () => {
    it("it should throw 401 error when no token provided", done => {
      const request = {
        oldPassword: _user.password,
        newPassword: faker.hacker.phrase()
      };

      chai
        .request(server)
        .put("/me/password")
        .send(request)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a("object");
          res.body.should.have.property("error");
          done();
        });
    });
  });

  /*
  * Update user password - Wrong credentials
  */
  describe("/PUT me", () => {
    it("it should throw 404 error when wrong old password given", done => {
      const request = {
        oldPassword: faker.hacker.phrase(),
        newPassword: faker.hacker.phrase()
      };

      chai
        .request(server)
        .put("/me/password")
        .set("Authorization", "Bearer " + _token)
        .send(request)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.should.have.property("error");
          done();
        });
    });
  });
});
