// routes/userGroupRoutes.js
const express = require("express");
const router = express.Router();
const userGroupController = require("../controllers/userGroupController");
const { authenticateToken, authorizeRole, checkgroup } = require("../middleware/authMiddleware");

// Route to get all user-group associations
router.get("/", userGroupController.getAllUserGroups);

// Route to get all groups for a specific user
//router.get("/user/:User_name", userGroupController.getUserGroups);

// Route to get all users in a specific group
//router.get("/group/:Group_id", userGroupController.getGroupUsers);

module.exports = router;
