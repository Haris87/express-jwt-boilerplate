const mongoose = require("mockgoose");
const User = require("../models/user");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");
const faker = require("faker");
const should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe("Users", () => {
  before(done => {
    //Before each test we empty the database
    User.remove({}, err => {
      done();
    });
  });

  const _user = {
    username: "test",
    email: "test@test.com",
    password: "test"
  };

  let _token;

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
          _token = res.body.token;
          done();
        });
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
