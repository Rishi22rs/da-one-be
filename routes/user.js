const express = require("express");

const router = express();
const { verifyToken } = require("../middlewares/auth.js");
const { addUserInfo } = require("../controllers/user.js");

router.post("/add-user-info", verifyToken, addUserInfo);

module.exports = router;
