// connectDB.js

const Sequelize = require("sequelize");

const database = "capstone_db";
const username = "postgres";
const password = "test@123";
const sequelize = new Sequelize(database, username, password, {
  host: "localhost",
  dialect: "postgres",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });