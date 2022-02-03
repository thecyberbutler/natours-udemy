const chai = require("chai");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const mochaSuite = require("./suites/mochaSuite");

mochaSuite("POST /user/signup", () => {
    it("creates a new user", (done) => {
        const name = "John Doe";
        const email = "john@doe.com";
        const password = "pass1234";
        request(app)
            .post("/user/signup")
            .send({ name, email, password })
            .end((_err, res) => {
                chai.expect(res.body.data.name === name);
                done();
            });
    });
});
