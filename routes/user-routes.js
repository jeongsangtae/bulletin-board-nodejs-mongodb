const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

// 가입 페이지
router.get("/signup", function (req, res) {
  let sessionSignUpInputData = req.session.inputData;

  // 가입 페이지 내용을 빈 내용으로 초기화
  if (!sessionSignUpInputData) {
    sessionSignUpInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      name: "",
      password: "",
    };
  }

  req.session.inputData = null;

  res.render("signup", { inputData: sessionSignUpInputData });
});

// 가입한 이메일, 패스워드를 mongodb에 저장
// 패스워드는 bcrypt를 통해서 hash되며, 안전하게 저장
router.post("/signup", async function (req, res) {
  const userData = req.body;
  const signUpEmail = userData.email;
  const signUpConfirmEmail = userData["confirm-email"];
  const signUpName = userData.name;
  const signUpPassword = userData.password;

  // 이메일, 이메일확인, 이름, 패스워드 등 잘못된 입력을 확인하는 코드
  if (
    !signUpEmail ||
    !signUpConfirmEmail ||
    !signUpName ||
    signUpName.trim().length > 6 ||
    !signUpPassword ||
    signUpPassword.trim().length < 6 ||
    signUpEmail !== signUpConfirmEmail ||
    !signUpEmail.includes("@")
  ) {
    req.session.inputData = {
      hasError: true,
      message: "잘못된 입력입니다. 다시 입력해주세요.",
      email: signUpEmail,
      confirmEmail: signUpConfirmEmail,
      name: signUpName,
      password: signUpPassword,
    };

    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  const existingSignUpUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: signUpEmail });

  // 이메일이 이미 존재하는지 확인해 다른 이메일을 입력하도록 한다.
  if (existingSignUpUser) {
    req.session.inputData = {
      hasError: true,
      message: "해당 이메일은 이미 사용중입니다.",
      email: signUpEmail,
      confirmEmail: signUpConfirmEmail,
      name: signUpName,
      password: signUpPassword,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  // 비밀번호 해싱
  const hashPassword = await bcrypt.hash(signUpPassword, 12);

  const user = {
    email: signUpEmail,
    name: signUpName,
    password: hashPassword,
  };

  await db.getDb().collection("users").insertOne(user);

  res.redirect("/login");
});

// 로그인 페이지
router.get("/login", function (req, res) {
  let sessionLoginInputData = req.session.inputData;

  // 로그인 페이지 내용을 빈 내용으로 초기화
  if (!sessionLoginInputData) {
    sessionLoginInputData = {
      hasError: false,
      email: "",
      name: "",
      password: "",
    };
  }

  req.session.inputData = null;

  res.render("login", { inputData: sessionLoginInputData });
});

// mongodb에서 입력한 이메일이 존재하는지 확인
router.post("/login", async function (req, res) {
  const userData = req.body;
  const loginEmail = userData.email;
  const loginPassword = userData.password;

  const existingLoginUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: loginEmail });

  // 이메일이 존재하는지 확인
  if (!existingLoginUser) {
    req.session.inputData = {
      hasError: true,
      message: "로그인할 수 없습니다. 존재하지 않는 이메일입니다.",
      email: loginEmail,
      password: loginPassword,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  const passwordEqual = await bcrypt.compare(
    loginPassword,
    existingLoginUser.password
  );

  // 해싱되기전 비밀번호와 해싱된 후 비밀번호를 비교해 일치하는지 확인
  if (!passwordEqual) {
    req.session.inputData = {
      hasError: true,
      message: "로그인할 수 없습니다. 패스워드가 틀렸습니다.",
      email: loginEmail,
      password: loginPassword,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  req.session.user = {
    id: existingLoginUser._id,
    name: existingLoginUser.name,
    email: existingLoginUser.email,
  };
  req.session.isAuthenticated = true;
  req.session.save(function () {
    res.redirect("/");
  });
});

// 사용자 본인이 쓴 게시글만 따로 모아 볼 수 있는 페이지
router.get("/profile", async function (req, res) {
  if (!res.locals.isAuth || !req.session.user) {
    return res.status(401).render("401");
  }

  const userEmail = req.session.user.email;
  const user = await db
    .getDb()
    .collection("users")
    .findOne({ email: userEmail });

  // 프로필 페이지네이션
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;
  const pageButtonSize = 5;
  const posts = await db
    .getDb()
    .collection("posts")
    .find({ email: userEmail })
    .sort({ num: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .project({ num: 1, title: 1, writer: 1, date: 1, count: 1 })
    .toArray();
  const countPosts = await db
    .getDb()
    .collection("posts")
    .countDocuments({ email: userEmail });
  const totalPages = Math.ceil(countPosts / pageSize);

  const firstPageGroup =
    Math.ceil(page / pageButtonSize) * pageButtonSize - pageButtonSize + 1;
  const lastPageGroup = Math.min(
    firstPageGroup + pageButtonSize - 1,
    totalPages
  );

  res.render("profile", {
    posts: posts,
    user: user,
    page: page,
    totalPages: totalPages,
    firstPageGroup: firstPageGroup,
    lastPageGroup: lastPageGroup,
  });
});

// 로그아웃하는 POST
router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});

module.exports = router;
