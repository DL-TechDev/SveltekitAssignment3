// db.js
var mysql = require("mysql2/promise");

// Create a connection to the database
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "nodelogin",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
