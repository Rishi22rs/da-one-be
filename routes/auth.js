const express = require("express");

const router = express();
const { createOtp, verifyOtp, currentStep } = require("../controllers/auth.js");
const { verifyToken } = require("../middlewares/auth.js");

router.post("/create-otp", createOtp);
router.post("/verify-otp", verifyOtp);
router.get("/verify-otp", (_req, res) => {
  return res.status(405).json({
    message: "Use POST /verify-otp with JSON body: { phone_number, otp }",
  });
});
router.get("/current-step", verifyToken, currentStep);

module.exports = router;
