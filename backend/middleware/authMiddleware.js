const jwt = require("jsonwebtoken");
require("dotenv").config();
const pool = require("../config/db");

// Middleware to check if the user is authenticated
async function authenticateToken(req, res, next) {
  const data = req.body;
  const token = req.cookies.token;

  if (token == null)
    return res.status(401).json({status: "error",message: "Token required.",
});

  let result;
  try {
        result = jwt.verify(token, process.env.JWT_SECRET);
        // Missing token
        if (!result) {
          return res.status(403).json({ status: "error", message: "Invalid token" });
        }
        // Different browser
        if (result.browser != req.headers["user-agent"]) {
          return res.status(403).json({ status: "error", message: "Invalid token" });
        }
        // Invalid Ip address
        if (result.ipaddress != req.ip) {
          return res.status(403).json({ status: "error", message: "Invalid token" });
        }
        console.log(result.User_name);
        let [results] = await pool.query(`SELECT User_name, active from User WHERE User_name = ?`, [result.User_name]);
        console.log(results);

        let activeStatus = results[0].active;
        console.log(activeStatus);
        if (activeStatus === 0) {
          return res.status(401).json({ status: "error", message: "Invalid Creditials" });
        }

        if (Object.entries(data).length === 0) {
          //console.log("data is empty");
          req.body = result;
          //res.json({token});
        } else {
          //console.log("data not empty");
          req.body = data;
        }
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "error", message: "Invalid token" });
  }

  next();
}

// Middleware to check if the user has a specific role
function authorizeRole(requiredRole) {
  return async (req, res, next) => {
    const token = req.cookies.token;
    result = jwt.verify(token, process.env.JWT_SECRET);
    const User_name = result.User_name;
    //console.log(User_name);
    if (await checkgroup(User_name, requiredRole)) {
      console.log("Checkgroup!");
      //console.log("We have cleared the authorizeRole");
      next();
    } else {
      return res.status(403).json({ status: "error", message: "Access denied." });
    }
  };
}

async function checkgroup(username, groupname) {
  try {
    //console.log("CheckGrp Function");
    // Query to check if the user is in the specified group directly
    const statement = `
      SELECT COUNT(*) AS isMember
      FROM user_group ug
      JOIN Grouplist gl ON ug.Group_id = gl.Group_id
      WHERE ug.User_name = ? AND gl.Group_name = ?
    `;
    //const connection = await pool.getConnection();
    const [results] = await pool.query(statement, [username, groupname]);
    //console.log(results);
    // If results[0].isMember is greater than 0, the user is in the group
    if (results[0].isMember > 0) {
      return true;
    }
  } catch (err) {
    console.error("Error checking group membership:", err);
    return false;
  }
}

module.exports = { authenticateToken, authorizeRole, checkgroup };
