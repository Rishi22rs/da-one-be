const express = require("express");

const router = express();
const { verifyToken } = require("../middlewares/auth.js");
const {
  addUserInfo,
  getUserInfo,
  updateUserLocation,
} = require("../controllers/user.js");

router.post("/add-user-info", verifyToken, addUserInfo);
router.get("/get-user-info", verifyToken, getUserInfo);
router.post("/update-user-location", verifyToken, updateUserLocation);

module.exports = router;
