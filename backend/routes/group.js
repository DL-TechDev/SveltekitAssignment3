// routes/groupRoutes.js
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const { authenticateToken, authorizeRole, checkgroup } = require("../middleware/authMiddleware");

// Admin Protected routes
router.get("/", groupController.getAllGroups);
router.get("/:Group_id", groupController.getGroupById);
router.post("/addgroup", groupController.AddNewGrp);

module.exports = router;
