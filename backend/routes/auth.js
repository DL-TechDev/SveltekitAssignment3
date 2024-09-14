const express = require("express");
const router = express.Router();
const authUser = require("../controllers/auth");

router.post("/login", authUser.authenticateUser);
router.post("/logout", authUser.UserLogout);

module.exports = router;
