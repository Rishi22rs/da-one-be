const express = require("express");

const router = express();
const { createOtp, verifyOtp, currentStep } = require("../controllers/auth.js");
const { verifyToken } = require("../middlewares/auth.js");

router.post("/create-otp", createOtp);
router.get("/verify-otp", verifyOtp);
router.get("/current-step", verifyToken, currentStep);

module.exports = router;
