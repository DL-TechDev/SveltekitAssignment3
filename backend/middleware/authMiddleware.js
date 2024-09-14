const jwt = require("jsonwebtoken");
require("dotenv").config();
const pool = require("../config/db");

// Middleware to check if the user is authenticated
function authenticateToken(req, res, next) {
  //const authHeader = req.headers["authorization"];
  //const token = authHeader && authHeader.split(" ")[1];
  console.log("Authenticate Token function is activated");

  //function expries
  // wrong secret
  // ip and user agent req.a

  // Check if token is in cookies or headers
  const token = req.cookies.token || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

  //const token = req.cookies.token;

  //
  if (token == null)
    return res.status(401).json({
      status: "error",
      message: "Token required.",
    });
  /*
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({
        status: "error",
        message: "Invalid token.",
      });
  */
  let result;
  try {
    result = jwt.verify(token, process.env.JWT_SECRET);
    if (!result) return res.status(403).json({ status: "error", message: "Invalid token" });
    if (result.browser != req.headers["user-agent"]) return res.status(403).json({ status: "error", message: "Invalid token" });
    if (result.ipaddress != req.ip) return res.status(403).json({ status: "error", message: "Invalid token" });
    req.user = result;
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "error", message: "Invalid token" });
  }

  //req.user = result;
  //req.user = user;
  //console.log(result.username);
  next();
}

// Middleware to check if the user has a specific role
function authorizeRole(requiredRole) {
  return (req, res, next) => {
    console.log("we are in the authorizeRole Function");
    //console.log(req.user);
    const User_name = req.user.username;
    //console.log(User_name);
    if (!checkgroup(User_name, requiredRole)) {
      return res.status(403).json({ status: "error", message: "Access denied." });
    } else {
      console.log("We have cleared the authorizeRole");
      next();
    }
  };
}

// Check which group the user is in
async function checkgroup(username, groupname) {
  try {
    //console.log("We are in the checkgroup function");
    //console.log("Username passed in: ", username);
    // first get user_group based on user name
    const [userResults] = await pool.query("SELECT Group_id FROM User_group WHERE User_name = ?", [username]);
    //console.log(userResults);
    if (userResults === 0) return false;

    const grpId = userResults[0].Group_id;
    //console.log("Group ID: ", grpId);

    // Find Group name
    const [groupResults] = await pool.query("SELECT Group_name FROM Grouplist WHERE Group_id = ?", [grpId]);
    if (groupResults === 0) return false;
    const retrievedGrpName = groupResults[0];
    //console.log("Retrived Group name: ", retrievedGrpName);

    // Compare the fetched group name with the provided group name
    if (groupname.localeCompare(retrievedGrpName)) {
      //console.log("true");
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { authenticateToken, authorizeRole, checkgroup };
