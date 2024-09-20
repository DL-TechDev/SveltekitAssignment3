// db.js
// Setup up config file variables
const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });
var mysql = require("mysql2/promise");

// Create a connection to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

module.exports = pool;