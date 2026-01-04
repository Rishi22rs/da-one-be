const axios = require("axios");
const db = require("../db");
const { generateToken } = require("../middlewares/auth");
const { getId } = require("../utils/getId");

const isNewUser = async (phoneNumber) => {
  const sql = `SELECT 1 FROM user WHERE phone_number = ? LIMIT 1`;
  const [rows] = await db.query(sql, [phoneNumber]);
  return rows.length === 0;
};

exports.verifyOtp = async (req, res) => {
  const { phone_number: phoneNumber, otp } = req.query;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: "Missing phone number or OTP" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [otpRows] = await conn.query(
      `
      SELECT 1 FROM user_phone_number_mapping
      WHERE phone_number = ? AND otp = ?
      LIMIT 1
      `,
      [phoneNumber, otp]
    );

    if (!otpRows.length) {
      await conn.rollback();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const newUser = await isNewUser(phoneNumber);

    let userId;

    if (newUser) {
      userId = getId();

      await conn.query(`INSERT INTO user (id, phone_number) VALUES (?, ?)`, [
        userId,
        phoneNumber,
      ]);
    } else {
      const [users] = await conn.query(
        `SELECT id FROM user WHERE phone_number = ? LIMIT 1`,
        [phoneNumber]
      );
      userId = users[0].id;
    }

    await conn.query(
      `DELETE FROM user_phone_number_mapping WHERE phone_number = ?`,
      [phoneNumber]
    );

    await conn.commit();

    return res.json({
      message: "Phone number verified",
      newUser,
      token: generateToken({ id: userId, phoneNumber }),
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  } finally {
    if (conn) conn.release();
  }
};

// exports.createOtp = (req, res) => {
//   const id = getId();
//   // const bypassNumbers = [7843887864, 1234567890];
//   const { phone_number: phoneNumber } = req.body;
//   // const otp = bypassNumbers.includes(Number(phoneNumber))
//   //   ? "6969"
//   //   : Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
//   const otp = "1234";
//   const addingPhoneNumberAndOtpSql = `INSERT INTO user_phone_number_mapping (id, phone_number,otp)
//   VALUES (?,?,?) ON DUPLICATE KEY UPDATE otp=?`;
//   //https://2factor.in/API/V1/34b58319-3cdf-11f0-a562-0200cd936042/SMS/+917843887864/6969/OTP1
//   // axios
//   //   .get(
//   //     `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KET}&variables_values=${otp}&route=otp&numbers=${phoneNumber}`
//   //   )
//   //   .then(() => {
//   // axios
//   //   .get(
//   //     `https://2factor.in/API/V1/${process.env.FACTOR_API_KEY}/SMS/+91${phoneNumber}/${otp}/OTP1`
//   //   )
//   //   .then(() => {
//   db.query(
//     addingPhoneNumberAndOtpSql,
//     [id, Number(phoneNumber), otp, otp],
//     (error, result) => {
//       if (error)
//         return res
//           .status(500)
//           .json({ message: "Error while creating OTP", error });
//       res.json({ message: "OTP created" });
//     }
//   );
//   // });
// };

exports.createOtp = async (req, res) => {
  const { phone_number: phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number required" });
  }

  const otp = "1234"; // dev only
  const id = getId();

  try {
    const sql = `
      INSERT INTO user_phone_number_mapping (id, phone_number, otp)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE otp = ?
    `;

    await db.query(sql, [id, phoneNumber, otp, otp]);

    // SMS send here (async, fire-and-forget)

    return res.json({ message: "OTP created" });
  } catch (err) {
    console.error("Create OTP error:", err);
    return res.status(500).json({ message: "Error while creating OTP" });
  }
};

exports.currentStep = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let screenRoute = "onboarding";
    let screenName = "login-route";

    const [[onboarding]] = await db.query(
      `
      SELECT 1 FROM user
      WHERE id = ? AND name IS NOT NULL AND name != ''
      LIMIT 1
      `,
      [userId]
    );

    const [[activeMatch]] = await db.query(
      `
      SELECT 1 FROM matches
      WHERE (user_id = ? OR other_user_id = ?)
        AND unmatched = 0
      LIMIT 1
      `,
      [userId, userId]
    );

    if (onboarding) {
      screenName = "bottom_tabs";
      screenRoute = "home";
    }

    if (activeMatch) {
      screenName = "match-route";
      screenRoute = "its-a-match";
    }

    return res.json({
      message: "verified",
      route: screenRoute,
      routeName: screenName,
      user: req.user,
    });
  } catch (err) {
    console.error("Current step error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
