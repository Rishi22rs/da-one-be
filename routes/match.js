const express = require("express");

const router = express();
const { verifyToken } = require("../middlewares/auth.js");
const {
  getNearbyUsers,
  addLikeOrDislike,
  unmatch,
} = require("../controllers/match.js");

router.post("/get-nearby-users", verifyToken, getNearbyUsers);
router.post("/add-like-dislike", verifyToken, addLikeOrDislike);
router.get("/unmatch", verifyToken, unmatch);

module.exports = router;
