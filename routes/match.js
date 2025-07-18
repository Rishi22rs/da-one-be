const express = require("express");

const router = express();
const { verifyToken } = require("../middlewares/auth.js");
const {
  getNearbyUsers,
  addLikeOrDislike,
  unmatch,
  getMatchedUserData,
  getMatchedUserIds,
  checkIfMatched,
} = require("../controllers/match.js");

router.post("/get-nearby-users", verifyToken, getNearbyUsers);
router.post("/add-like-dislike", verifyToken, addLikeOrDislike);
router.get("/unmatch", verifyToken, unmatch);
router.get("/matched-user-data", verifyToken, getMatchedUserData);
router.get("/matched-user-ids", verifyToken, getMatchedUserIds);
router.get("/check-if-matched", verifyToken, checkIfMatched);

module.exports = router;
