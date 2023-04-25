const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.post("/signup", function (req, res) {});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", function (req, res) {});

router.get("/profile", function (req, res) {
  res.render("profile");
});

module.exports = router;
