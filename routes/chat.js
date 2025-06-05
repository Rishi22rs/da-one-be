const express = require("express");
const router = express.Router();
const { addChatMessage, getChatsBetweenUsers } = require("../controllers/chat");
const { verifyToken } = require("../middlewares/auth");

router.post("/add-chat", verifyToken, addChatMessage);
router.post("/get-chat", verifyToken, getChatsBetweenUsers);

module.exports = router;
