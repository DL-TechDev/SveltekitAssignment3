const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const groupController = require("../controllers/groupController");
//const userGroupController = require("../controllers/userGroupController");
const { authenticateToken, authorizeRole, checkgroup } = require("../middleware/authMiddleware");

// User Protected routes
router.get("/profile", authenticateToken, userController.getUser);
router.get("/GroupName", authenticateToken, userController.getGroupName);
router.put("/update-email", authenticateToken, userController.updateEmail);
router.put("/update-password", authenticateToken, userController.updatePassword);
router.put("/update-active", authenticateToken, authorizeRole("Admin"), userController.updateUserActive);
router.put("/update-groups", authenticateToken, authorizeRole("Admin"), userController.updateUsrGrp);

// Admin Protected routes
router.get("/getall", authenticateToken, authorizeRole("Admin"), userController.getAllUser);
router.post("/create", authenticateToken, authorizeRole("Admin"), userController.CreateNewUser);
router.put("/updatedetails", authenticateToken, authorizeRole("Admin"), userController.updateUserDetails);
router.post("/addGroup", authenticateToken, authorizeRole("Admin"), groupController.AddNewGrp);
router.get("/getGroupNames", authenticateToken, authorizeRole("Admin"), groupController.getAllGroupNames);

module.exports = router;
