const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
//const userGroupController = require("../controllers/userGroupController");
const { authenticateToken, authorizeRole, checkgroup } = require("../middleware/authMiddleware");

// User Protected routes
router.get("/profile",authenticateToken,authorizeRole('User'), userController.getUser);
router.put("/update-email", authenticateToken, authorizeRole('User'), userController.updateEmail);
router.put("/update-password", authenticateToken, authorizeRole('User'), userController.updatePassword);

// Admin Protected routes
router.get("/getall", userController.getAllUser);
router.post("/create", userController.CreateNewUser);
router.put("/updatedetails", userController.updateUserDetails);

//router.get("/getall", authenticateToken, authorizeRole('Admin'), userController.getAllUser);
//router.post("/create", authenticateToken, authorizeRole("Admin"), userController.CreateNewUser);
//router.put("/updatedetails", authenticateToken, authorizeRole("Admin"), userController.updateUserDetails);

// check username and password, get token, check group )
// nav check whether you are 

module.exports = router;
