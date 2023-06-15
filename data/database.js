const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let mongodbUrl = "mongodb://127.0.0.1:27017";

let database;

// 환경 변수 처리 mongo atlas 연결 및 render에 추가
if (process.env.MONGODB_URL) {
  mongodbUrl = process.env.MONGODB_URL;
}

async function connectToDatabase() {
  const client = await MongoClient.connect(mongodbUrl);
  database = client.db("bulletin-board");
}

function getDb() {
  if (!database) {
    // throw { message: "데이터베이스 연결이 설정되지 않았습니다" };
    throw new Error("데이터베이스 연결이 설정되지 않았습니다");
  }
  return database;
}

module.exports = {
  connectToDatabase: connectToDatabase,
  getDb: getDb,
};
