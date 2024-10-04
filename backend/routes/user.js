const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const groupController = require("../controllers/groupController");
//const userGroupController = require("../controllers/userGroupController");
const { authenticateToken, authorizeRole, checkgroup } = require("../middleware/authMiddleware");

// User Protected routes
router.get("/profile", authenticateToken, userController.getUser);
router.put("/update-email", authenticateToken, userController.updateEmail);
router.put("/update-password", authenticateToken, userController.updatePassword);
router.post("/user-group-name", authenticateToken, userController.getGroupName);
router.get("/app-getGroupNames", authenticateToken,groupController.getAllGroupNames);

// Admin Protected routes
router.get("/getall", authenticateToken, authorizeRole("Admin"), userController.getAllUser);
router.get("/GroupName", authenticateToken, authorizeRole("Admin"), userController.getGroupName);
router.post("/create", authenticateToken, authorizeRole("Admin"), userController.CreateNewUser);
router.put("/update-email-admin", authenticateToken, authorizeRole("Admin"), userController.updateEmail);
router.put("/update-password-admin", authenticateToken, authorizeRole("Admin"), userController.updatePassword);
router.post("/addGroup", authenticateToken, authorizeRole("Admin"), groupController.AddNewGrp);
router.get("/getGroupNames", authenticateToken, authorizeRole("Admin"), groupController.getAllGroupNames);
router.put("/update-active", authenticateToken, authorizeRole("Admin"), userController.updateUserActive);
router.put("/update-groups", authenticateToken, authorizeRole("Admin"), userController.updateUsrGrp);

module.exports = router;
