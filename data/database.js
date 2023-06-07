const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let mongodbUrl = "mongodb://127.0.0.1:27017";

let database;

if (process.env.MONGODB_URL) {
  mongodbUrl = process.env.MONGODB_URL;
}

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(mongodbUrl);
    database = client.db("bulletin-board");
  } catch (error) {
    console.error("데이터베이스 연결이 설정되지 않았습니다", error);
  }
}

function getDb() {
  if (!database) {
    throw { message: "데이터베이스 연결이 설정되지 않았습니다" };
  }
  return database;
}

module.exports = {
  connectToDatabase: connectToDatabase,
  getDb: getDb,
};
