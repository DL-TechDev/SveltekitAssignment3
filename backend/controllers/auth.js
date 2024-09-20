const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Authenticate user login
exports.authenticateUser = async (req, res) => {
  const { User_name, Password } = req.body;

  if (!User_name || !Password) {
    return res.status(400).json({
      status: "error",
      message: "Username and password are required.",
    });
  }
  //let connection;

  try {
    //connection = await pool.getConnection();
    // Fetch user from the database
    const [results, fields] = await pool.query("SELECT * FROM User WHERE User_name = ?", [User_name]);
    if (results.length === 0) {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }
    const user = results[0];

    const activeStatus = user.Active;
    console.log("Active status: ", activeStatus);

    // check for disable account
    if (activeStatus == 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userHashP = user.Password;

    // Compare the password with the hashed password from the database
    const match = await bcrypt.compare(Password, userHashP);

    if (match) {
      // Passwords match
      // Generate JWT token
      const token = jwt.sign(
        {
          User_name: User_name,
          ipaddress: req.ip,
          browser: req.headers['user-agent']
        }, process.env.JWT_SECRET,
        {
          expiresIn: "1h"
        });

      // Set JWT token in a cookie
      res.cookie("token", token, {
        httpOnly: true, // Prevent client-side JS from accessing the token
        maxAge: 3600000, // 1 hour in milliseconds
      });

      res.status(200).json({ message: "Authentication successful" });
    } else {
      // Passwords do not match
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
    // } finally {
    //   connection.release();
    // }
  }
};

exports.UserLogout = (req, res) => {
  // Clear the authentication token cookie
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "Logout successful" });
};