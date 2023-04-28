const expressSession = require("express-session");
const mongoDbStore = require("connect-mongodb-session");
const dotenv = require("dotenv");
dotenv.config(); // .env 파일의 환경 변수를 로드한다.

const secretKey = process.env.SECRET_KEY;

function createSessionStore() {
  const MongoDBStore = mongoDbStore(expressSession);

  const sessionStore = new MongoDBStore({
    uri: "mongodb://127.0.0.1:27017",
    databaseName: "bulletin-board",
    collection: "sessions",
  });

  return sessionStore;
}

function createSessionConfig() {
  return {
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
  };
}

module.exports = createSessionConfig;
