const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  // num, title, writer, date의 정보만 보여준다.
  const posts = await db
    .getDb()
    .collection("posts")
    .find({})
    .project({ num: 1, title: 1, writer: 1, date: 1 })
    .toArray();
  res.render("board-list", { posts: posts });
});

router.get("/create-post", function (req, res) {
  res.render("create-post");
});

router.post("/posts", async function (req, res) {
  // 가장 최근 게시물 불러오기
  const lastPost = await db
    .getDb()
    .collection("posts")
    .findOne({}, { sort: { num: -1 } });

  // num이 존재하지 않으면 1로 초기화
  let num = lastPost ? lastPost.num + 1 : 1;
  let date = new Date();
  const newPost = {
    num: num,
    title: req.body.title,
    writer: req.body.writer,
    password: req.body.password,
    content: req.body.content,
    date: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`,
  };

  const result = await db.getDb().collection("posts").insertOne(newPost);
  console.log(result);
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  let postId = req.params.id;

  try {
    postId = new ObjectId(postId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const post = await db.getDb().collection("posts").findOne({ _id: postId });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("post-content", { post: post });
});

module.exports = router;
