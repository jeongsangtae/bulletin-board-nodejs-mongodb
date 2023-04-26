const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const signUpEmail = userData.email;
  const signUpConfirmEmail = userData["confirm-email"];
  const signUpPassword = userData.password;

  const user = {
    email: signUpEmail,
    password: signUpPassword,
  };

  await db.getDb().collection("users").insertOne(user);

  res.redirect("/login");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", function (req, res) {});

router.get("/profile", function (req, res) {
  res.render("profile");
});

module.exports = router;
