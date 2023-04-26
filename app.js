const path = require("path");

const express = require("express");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session");

const boardRoutes = require("./routes/board-routes");
const userRoutes = require("./routes/user-routes");
const db = require("./data/database");

const MongoDBStore = mongodbStore(session);

const app = express();

// const sessionStore = new MongoDBStore({
//   uri: "mongodb://127.0.0.1:27017",
//   databaseName: "bulletin-board",
//   collection: "sessions",
// })

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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
