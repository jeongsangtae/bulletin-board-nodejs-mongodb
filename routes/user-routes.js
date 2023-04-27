const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

router.get("/signup", function (req, res) {
  res.render("signup");
});

// 가입한 이메일, 패스워드를 mongodb에 저장
// 패스워드는 bcrypt를 통해서 hash되며, 안전하게 저장
router.post("/signup", async function (req, res) {
  const userData = req.body;
  const signUpEmail = userData.email;
  const signUpConfirmEmail = userData["confirm-email"];
  const signUpPassword = userData.password;

  if (
    !signUpEmail ||
    !signUpConfirmEmail ||
    !signUpPassword ||
    signUpPassword.trim().length < 6 ||
    signUpEmail !== signUpConfirmEmail ||
    !signUpEmail.includes("@")
  ) {
    console.log("잘못된 정보가 입력되었습니다.");
    return res.redirect("/signup");
  }

  const existingSignUpUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: signUpEmail });

  // 이메일이 이미 존재하는지 확인해 다른 이메일을 입력하도록 한다.
  if (existingSignUpUser) {
    console.log("해당 이메일은 이미 사용중입니다.");
    return res.redirect("/signup");
  }

  // 비밀번호 해싱
  const hashPassword = await bcrypt.hash(signUpPassword, 12);

  const user = {
    email: signUpEmail,
    password: hashPassword,
  };

  await db.getDb().collection("users").insertOne(user);

  res.redirect("/login");
});

router.get("/login", function (req, res) {
  res.render("login");
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
    console.log("로그인할 수 없습니다. 존재하지 않는 이메일입니다.");
    return res.redirect("/login");
  }

  const passwordEqual = await bcrypt.compare(
    loginPassword,
    existingLoginUser.password
  );

  // 해싱되기전 비밀번호와 해싱된 후 비밀번호를 비교해 일치하는지 확인
  if (!passwordEqual) {
    console.log("로그인할 수 없습니다. 패스워드가 틀렸습니다.");
    return res.redirect("/login");
  }

  console.log("사용자 인증되었습니다.");
  res.redirect("/");
});

router.get("/profile", function (req, res) {
  res.render("profile");
});

module.exports = router;
