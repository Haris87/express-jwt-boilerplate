const mongoose = require("mockgoose");
const User = require("../models/user");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");
const should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe("Users", () => {
  beforeEach(done => {
    //Before each test we empty the database
    User.remove({}, err => {
      done();
    });
  });
  /*
  * Test the /GET route
  */
  describe("/GET users", () => {
    it("it should GET all the users", done => {
      chai
        .request(server)
        .get("/users")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});
