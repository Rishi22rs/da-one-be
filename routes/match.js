const express = require("express");

const router = express();
const { verifyToken } = require("../middlewares/auth.js");
const { getNearbyUsers, addLikeOrDislike } = require("../controllers/match.js");

router.post("/get-nearby-users", verifyToken, getNearbyUsers);
router.post("/add-like-dislike", verifyToken, addLikeOrDislike);

module.exports = router;
