const express = require("express");
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

// 게시글이 보여지는 메인페이지 (페이지네이션 포함)
router.get("/posts", async function (req, res) {
  // 페이지네이션
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;
  const pageButtonSize = 5;
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

  const firstPageGroup =
    Math.ceil(page / pageButtonSize) * pageButtonSize - pageButtonSize + 1;
  const lastPageGroup = Math.min(
    firstPageGroup + pageButtonSize - 1,
    totalPages
  );
  res.render("board-list", {
    posts: posts,
    page: page,
    totalPages: totalPages,
    firstPageGroup: firstPageGroup,
    lastPageGroup: lastPageGroup,
  });
});

// 게시글 생성하는 POST
router.post("/posts", async function (req, res) {
  if (!req.session.user) {
    return res.status(401).render("401");
  }
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

  // 해싱된 비밀번호와 입력한 패스워드를 비교해서 확인
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

// 게시글 쓰는 페이지 
router.get("/create-post", async function (req, res) {
  if (!res.locals.isAuth || !req.session.user) {
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

// 게시글, 댓글, 답글이 내용이 보여지는 페이지
router.get("/posts/:id", async function (req, res) {
  let postId = req.params.id;

  try {
    postId = new ObjectId(postId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const post = await db.getDb().collection("posts").findOne({ _id: postId });
  console.log(postId);
  if (!post) {
    return res.status(404).render("404");
  }

  // 게시글 조회수 10초 텀으로 오르도록 한다.
  const sessionKey = `count:${postId}`;

  const lastCountTime = req.session[sessionKey];
  const currentCountTime = new Date().getTime();
  const elapsedCountTime = currentCountTime - lastCountTime;

  const countInterval = 10000;

  // 게시글 조회수 오르도록 하는 코드
  if (!lastCountTime || elapsedCountTime >= countInterval) {
    await db
      .getDb()
      .collection("posts")
      .updateOne({ _id: postId }, { $inc: { count: 1 } });

    req.session[sessionKey] = currentCountTime;
  }

  let user = null;
  if (req.session.user && req.session.user.email) {
    const userEmail = req.session.user.email;
    user = await db.getDb().collection("users").findOne({ email: userEmail });
  }

  const comment = await db
    .getDb()
    .collection("comments")
    .find({ post_id: postId })
    .toArray();

  // 답글이 어떤 댓글에서 작성되었는지 찾는 코드
  const replyPromises = comment.map(async (c) => {
    const reply = await db
      .getDb()
      .collection("replies")
      .find({ comment_id: new ObjectId(c._id) })
      .toArray();
    return reply;
  });

  const reply = await Promise.all(replyPromises);

  // console.log(reply);

  res.render("post-content", {
    user: user,
    post: post,
    comment: comment,
    reply: reply,
  });
});

// 게시글 수정 페이지
router.get("/posts/:id/edit", async function (req, res) {
  if (!res.locals.isAuth || !req.session.user) {
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

  const userEmail = req.session.user.email;
  const user = await db
    .getDb()
    .collection("users")
    .findOne({ email: userEmail });

  if (post.email !== user.email) {
    return res.status(401).render("401");
  }

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", {
    post: post,
    user: user,
    title: "",
    content: "",
    passwordErrorMessage: "",
  });
});

// 게시글 수정 POST
router.post("/posts/:id/edit", async function (req, res) {
  if (!res.locals.isAuth || !req.session.user) {
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

  const titleInput = req.body.title;
  const contentInput = req.body.content;
  const passwordInput = req.body.password;

  const updateData = {
    title: titleInput,
    content: contentInput,
  };

  const userEmail = req.session.user.email;
  const user = await db
    .getDb()
    .collection("users")
    .findOne({ email: userEmail });

  // 해싱된 비밀번호를 입력한 비밀번호와 비교
  const passwordEqual = await bcrypt.compare(passwordInput, user.password);

  if (!passwordEqual) {
    return res.render("update-post", {
      post: post,
      user: user,
      title: titleInput,
      content: contentInput,
      passwordErrorMessage: "비밀번호가 다릅니다. 다시 확인해주세요!",
    });
  }

  await db
    .getDb()
    .collection("posts")
    .updateOne({ _id: new ObjectId(postId) }, { $set: updateData });
  res.redirect("/posts/" + postId);
});

// 게시글 삭제하는 POST (게시글 삭제시 해당 게시글의 모든 댓글과 답글도 함께 삭제)
router.post("/posts/:id/delete", async function (req, res) {
  if (!res.locals.isAuth || !req.session.user) {
    return res.status(401).render("401");
  }

  let postId = req.params.id;

  try {
    postId = new ObjectId(postId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const post = await db.getDb().collection("posts").findOne({ _id: postId });

  // console.log(postId);

  // console.log(post._id);

  // const comments = await db
  //   .getDb()
  //   .collection("comments")
  //   .find({ post_id: postId })
  //   .toArray();

  // for (const comment of comments) {
  //   await db
  //     .getDb()
  //     .collection("replies")
  //     .deleteMany({ comment_id: comment._id });
  // }

  await db.getDb().collection("replies").deleteMany({ post_id: postId });

  await db.getDb().collection("comments").deleteMany({ post_id: postId });

  await db.getDb().collection("posts").deleteOne({ _id: postId });

  // 게시글 삭제시 게시글 번호가 비어있지 않도록 삭제한 게시글 뒤에 있는 게시글의 번호들을 1씩 감소
  // 삭제한 게시글 뒤에 있는 게시글의 번호를 확인하기 위해 $gt를 사용해 번호가 더 큰 것을 확인해서 감소시킨다.
  await db
    .getDb()
    .collection("posts")
    .updateMany({ num: { $gt: post.num } }, { $inc: { num: -1 } });

  res.redirect("/posts");
});

// 댓글을 추가하는 POST
router.post("/posts/:id/comments", async function (req, res) {
  let postId = req.params.id;
  let date = new Date();

  try {
    postId = new ObjectId(postId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const post = await db.getDb().collection("posts").findOne({ _id: postId });

  const contentInput = req.body.content;
  const userEmail = req.session.user.email;
  const user = await db
    .getDb()
    .collection("users")
    .findOne({ email: userEmail });

  // 댓글을 추가하는데 작성 날짜는 "2023.6.12 08:07:55" 이런식으로 시간까지 나오도록 해준다.
  const newComment = {
    post_id: post._id,
    name: user.name,
    email: user.email,
    content: contentInput,
    date: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`,
  };

  await db.getDb().collection("comments").insertOne(newComment);

  res.redirect("/posts/" + postId);
});

// 댓글을 수정하는 POST
router.post("/posts/:id/comments/edit", async function (req, res) {
  let postId = req.params.id;
  let commentId = req.body.commentId;

  try {
    commentId = new ObjectId(commentId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const comment = await db
    .getDb()
    .collection("comments")
    .findOne({ _id: commentId });

  const commentContent = req.body.content;

  const updateCommentData = {
    content: commentContent,
  };

  if (!comment) {
    return res.status(404).render("404");
  }

  await db
    .getDb()
    .collection("comments")
    .updateOne({ _id: commentId }, { $set: updateCommentData });

  res.redirect("/posts/" + postId);
});

// 댓글을 삭제하는 POST (댓글 삭제시 해당 댓글에 작성된 모든 답글도 함께 삭제)
router.post("/posts/:id/comments/delete", async function (req, res) {
  let postId = req.params.id;
  let commentId = req.body.commentId;

  try {
    commentId = new ObjectId(commentId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const comment = await db
    .getDb()
    .collection("comments")
    .findOne({ _id: commentId });

  if (!comment) {
    return res.status(404).render("404");
  }

  await db.getDb().collection("replies").deleteMany({ comment_id: commentId });

  await db.getDb().collection("comments").deleteOne({ _id: commentId });

  res.redirect("/posts/" + postId);
});

// 댓글에 답글 추가하는 POST
router.post("/posts/:id/comments/replies", async function (req, res) {
  let postId = req.params.id;
  let commentId = req.body.commentId;
  let date = new Date();

  try {
    postId = new ObjectId(postId);
  } catch (error) {
    return res.status(404).render("404");
  }

  try {
    commentId = new ObjectId(commentId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const contentInput = req.body.content;
  const userEmail = req.session.user.email;
  const user = await db
    .getDb()
    .collection("users")
    .findOne({ email: userEmail });

  const comment = await db
    .getDb()
    .collection("comments")
    .findOne({ _id: commentId });

  // 댓글에서 했던 방식과 같이 표기되는 날짜가 시간까지 표기
  const newReply = {
    post_id: postId,
    comment_id: comment._id,
    name: user.name,
    email: user.email,
    content: contentInput,
    date: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`,
  };

  await db.getDb().collection("replies").insertOne(newReply);

  res.redirect("/posts/" + postId);
});

// 답글 수정하는 POST
router.post("/posts/:id/comments/replies/edit", async function (req, res) {
  let postId = req.params.id;
  let replyId = req.body.replyId;

  try {
    replyId = new ObjectId(replyId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const reply = await db
    .getDb()
    .collection("replies")
    .findOne({ _id: replyId });

  const replyContent = req.body.content;

  const updataReplyData = {
    content: replyContent,
  };

  if (!reply) {
    return res.status(404).render("404");
  }

  await db
    .getDb()
    .collection("replies")
    .updateOne({ _id: replyId }, { $set: updataReplyData });

  res.redirect("/posts/" + postId);
});

// 답글 삭제하는 POST
router.post("/posts/:id/comments/replies/delete", async function (req, res) {
  let postId = req.params.id;
  let replyId = req.body.replyId;

  try {
    replyId = new ObjectId(replyId);
  } catch (error) {
    return res.status(404).render("404");
  }

  const reply = await db
    .getDb()
    .collection("replies")
    .findOne({ _id: replyId });

  if (!reply) {
    return res.status(404).render("404");
  }

  await db.getDb().collection("replies").deleteOne({ _id: replyId });

  res.redirect("/posts/" + postId);
});

module.exports = router;
