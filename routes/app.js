const express = require("express");

const router = express();
const { verifyToken } = require("../middlewares/auth.js");
const { getUserAlerts, markAlertsAsRead } = require("../controllers/app.js");

router.get("/get-alerts", verifyToken, getUserAlerts);
router.get("/mark-alert-as-read", verifyToken, markAlertsAsRead);

module.exports = router;
