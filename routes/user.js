const express = require("express");

const router = express();
const { verifyToken } = require("../middlewares/auth.js");
const { addUserInfo, getUserInfo } = require("../controllers/user.js");

router.post("/add-user-info", verifyToken, addUserInfo);
router.get("/get-user-info", verifyToken, getUserInfo);

module.exports = router;
