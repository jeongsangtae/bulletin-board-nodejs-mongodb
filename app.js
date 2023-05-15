const path = require("path");

const express = require("express");
const expressSession = require("express-session");

const createSessionConfig = require("./config/session");
const db = require("./data/database");
const userAuthMiddleware = require("./middlewares/user");
const boardRoutes = require("./routes/board-routes");
const userRoutes = require("./routes/user-routes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));

app.use(userAuthMiddleware);

app.use(boardRoutes);
app.use(userRoutes);

app.use(function (error, req, res, next) {
  console.log(error);
  res.status(500).render("500");
});

db.connectToDatabase()
  .then(function () {
    app.listen(3000);
  })
  .catch(function (error) {
    console.log("데이터베이스에 연결하지 못했습니다.");
    console.log(error);
  });
