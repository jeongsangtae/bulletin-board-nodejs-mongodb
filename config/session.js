const expressSession = require("express-session");
const mongoDbStore = require("connect-mongodb-session");
const dotenv = require("dotenv");
dotenv.config(); // .env 파일의 환경 변수를 로드한다.

const secretKey = process.env.SECRET_KEY;

let mongodbUrl = "mongodb://127.0.0.1:27017";

if (process.env.MONGODB_URL) {
  mongodbUrl = process.env.MONGODB_URL;
}

function createSessionStore() {
  const MongoDBStore = mongoDbStore(expressSession);

  const sessionStore = new MongoDBStore({
    uri: mongodbUrl,
    databaseName: "bulletin-board",
    collection: "sessions",
    clearExpired: true,
    checkExpirationInterval: 60 * 60 * 1000,
  });

  return sessionStore;
}

function createSessionConfig() {
  return {
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
    },
  };
}

module.exports = createSessionConfig;
