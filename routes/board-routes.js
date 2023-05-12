const express = require("express");
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;
  // const pageButton = 5;
  const posts = await db
    .getDb()
    .collection("posts")
    .find({})
    .sort({ num: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .project({ num: 1, title: 1, writer: 1, date: 1, count: 1 })
    .toArray();
  const countPosts = await db.getDb().collection("posts").countDocuments({});
  const totalPages = Math.ceil(countPosts / pageSize);
  // const totalPageButton = Math.ceil(totalPages / pageButton);
  res.render("board-list", {
    posts: posts,
    page: page,
    totalPages: totalPages,
    // totalPageButton: totalPageButton,
  });
});

router.post("/posts", async function (req, res) {
  // 가장 최근 게시물 불러오기
  const lastPost = await db
    .getDb()
    .collection("posts")
    .findOne({}, { sort: { num: -1 } });

  const userEmail = req.session.user.email;
  const user = await db
    .getDb()
    .collection("users")
    .findOne({ email: userEmail });

  const titleInput = req.body.title;
  const passwordInput = req.body.password;
  const contentInput = req.body.content;

  // num이 존재하지 않으면 1로 초기화
  let num = lastPost ? lastPost.num + 1 : 1;
  let date = new Date();
  let count = 0;
  const newPost = {
    num: num,
    title: titleInput,
    writer: req.body.writer,
    content: contentInput,
    // password: user.password,
    count: count,
    date: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`,
    email: user.email,
  };

  const passwordEqual = await bcrypt.compare(passwordInput, user.password);

  if (!passwordEqual) {
    console.log("비밀번호가 틀렸습니다.");
    return res.render("create-post", {
      user: user,
      title: titleInput,
      content: contentInput,
      passwordErrorMessage: "비밀번호가 다릅니다. 다시 확인해주세요!",
    });
  }

  const result = await db.getDb().collection("posts").insertOne(newPost);
  console.log(result);
  res.redirect("/posts");
});

router.get("/create-post", async function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  const userEmail = req.session.user.email;
  const user = await db
    .getDb()
    .collection("users")
    .findOne({ email: userEmail });

  res.render("create-post", {
    user: user,
    title: "",
    content: "",
    passwordErrorMessage: "",
  });
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

  await db
    .getDb()
    .collection("posts")
    .updateOne({ _id: postId }, { $inc: { count: 1 } });

  const user = req.session.user || null;

  res.render("post-content", {
    user: user,
    post: post,
  });
});

router.get("/posts/:id/edit", async function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne(
      { _id: new ObjectId(postId) },
      { title: 1, writer: 1, password: 1, content: 1 }
    );

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: post });
});

router.post("/posts/:id/edit", async function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  const postId = req.params.id;
  const updateData = {
    title: req.body.title,
    writer: req.body.writer,
    content: req.body.content,
  };

  await db
    .getDb()
    .collection("posts")
    .updateOne({ _id: new ObjectId(postId) }, { $set: updateData });
  res.redirect("/posts/" + postId);
});

router.post("/posts/:id/delete", async function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) });

  await db
    .getDb()
    .collection("posts")
    .deleteOne({ _id: new ObjectId(postId) });

  await db
    .getDb()
    .collection("posts")
    .updateMany({ num: { $gt: post.num } }, { $inc: { num: -1 } });

  res.redirect("/posts");
});

module.exports = router;
