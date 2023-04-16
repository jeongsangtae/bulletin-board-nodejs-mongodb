const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.render("posts");
});

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    .find({})
    .project({ num: 1, title: 1, writer: 1, date: 1 })
    .toArray();
  res.render("board-list", { posts: posts });
});

// router.get("/new-post", async function (req, res) {
//   const users = await db.getDb().collection("users").find().toArray();
//   res.render("create-post", { users: users });
// });

router.post("/posts", async function (req, res) {
  const newPost = {
    num: req.body.num,
    title: req.body.title,
    writer: req.body.writer,
    password: req.body.password,
    content: req.body.content,
    date: new Date(),
  };

  const result = await db.getDb().collection("posts").insertOne(newPost);
  console.log(result);
  res.redirect("/posts");
});
