const axios = require("axios");
const db = require("../db");
const { generateToken } = require("../middlewares/auth");
const { getId } = require("../utils/getId");

const getPositiveIntEnv = (envValue, fallbackValue) => {
  const parsed = Number.parseInt(envValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
};

const OTP_EXPIRY_MINUTES = getPositiveIntEnv(process.env.OTP_EXPIRY_MINUTES, 5);
const OTP_MAX_ATTEMPTS = getPositiveIntEnv(process.env.OTP_MAX_ATTEMPTS, 5);
const OTP_BLOCK_MINUTES = getPositiveIntEnv(process.env.OTP_BLOCK_MINUTES, 15);

// In-memory attempt store for single-instance deployments.
// For multi-instance deployments, move this to Redis.
const otpAttemptStore = new Map();

const resolveUserForPhone = async (conn, phoneNumber) => {
  const [existingUsers] = await conn.query(
    `SELECT id FROM user WHERE phone_number = ? ORDER BY id LIMIT 1`,
    [phoneNumber],
  );

  if (existingUsers.length) {
    return {
      userId: existingUsers[0].id,
      newUser: false,
    };
  }

  const createdId = getId();

  try {
    await conn.query(`INSERT INTO user (id, phone_number) VALUES (?, ?)`, [
      createdId,
      phoneNumber,
    ]);

    return {
      userId: createdId,
      newUser: true,
    };
  } catch (err) {
    // Safe fallback once UNIQUE(user.phone_number) exists:
    // if another transaction inserted first, we fetch that row.
    if (err?.code !== "ER_DUP_ENTRY") {
      throw err;
    }

    const [usersAfterDup] = await conn.query(
      `SELECT id FROM user WHERE phone_number = ? ORDER BY id LIMIT 1`,
      [phoneNumber],
    );

    if (!usersAfterDup.length) {
      throw new Error("User insert conflicted but no row found for phone number");
    }

    return {
      userId: usersAfterDup[0].id,
      newUser: false,
    };
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone_number: phoneNumber, otp } = req.body || {};

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: "Missing phone number or OTP" });
  }

  const now = Date.now();
  const attemptState = otpAttemptStore.get(phoneNumber);
  if (attemptState?.blockedUntil && attemptState.blockedUntil > now) {
    return res.status(429).json({
      message: "Too many attempts. Try again later.",
      retry_after_seconds: Math.ceil((attemptState.blockedUntil - now) / 1000),
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[otpRow]] = await conn.query(
      `
      SELECT
        otp,
        timestamp,
        TIMESTAMPDIFF(SECOND, timestamp, CURRENT_TIMESTAMP) AS otp_age_seconds
      FROM user_phone_number_mapping
      WHERE phone_number = ?
      ORDER BY timestamp DESC
      LIMIT 1
      FOR UPDATE
      `,
      [phoneNumber],
    );

    if (!otpRow) {
      await conn.rollback();
      return res.status(401).json({ message: "OTP not found or expired" });
    }

    const otpAgeSeconds = Number(otpRow.otp_age_seconds);
    const isExpired =
      !Number.isFinite(otpAgeSeconds) ||
      otpAgeSeconds > OTP_EXPIRY_MINUTES * 60;

    if (isExpired) {
      await conn.query(
        `DELETE FROM user_phone_number_mapping WHERE phone_number = ?`,
        [phoneNumber],
      );
      await conn.commit();
      return res
        .status(401)
        .json({ message: "OTP expired. Please request a new OTP." });
    }

    if (String(otpRow.otp) !== String(otp)) {
      const failedAttempts = (attemptState?.failedAttempts || 0) + 1;

      if (failedAttempts >= OTP_MAX_ATTEMPTS) {
        otpAttemptStore.set(phoneNumber, {
          failedAttempts,
          blockedUntil: now + OTP_BLOCK_MINUTES * 60 * 1000,
        });

        await conn.query(
          `DELETE FROM user_phone_number_mapping WHERE phone_number = ?`,
          [phoneNumber],
        );
        await conn.commit();

        return res.status(429).json({
          message: `Too many invalid OTP attempts. Request a new OTP in ${OTP_BLOCK_MINUTES} minutes.`,
        });
      }

      otpAttemptStore.set(phoneNumber, {
        failedAttempts,
        blockedUntil: 0,
      });

      await conn.rollback();
      return res.status(401).json({
        message: "Invalid OTP",
        attempts_left: OTP_MAX_ATTEMPTS - failedAttempts,
      });
    }

    const { userId, newUser } = await resolveUserForPhone(conn, phoneNumber);

    // Ensure swipe config exists for both new and legacy users.
    await conn.query(
      `
      INSERT INTO user_config (id, user_id, swipes, blocked)
      SELECT ?, ?, 10, 0
      WHERE NOT EXISTS (
        SELECT 1 FROM user_config WHERE user_id = ? LIMIT 1
      )
      `,
      [getId(), userId, userId],
    );

    await conn.query(
      `DELETE FROM user_phone_number_mapping WHERE phone_number = ?`,
      [phoneNumber],
    );

    otpAttemptStore.delete(phoneNumber);
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
    await db.query(`DELETE FROM user_phone_number_mapping WHERE phone_number = ?`, [
      phoneNumber,
    ]);

    await db.query(
      `
      INSERT INTO user_phone_number_mapping (id, phone_number, otp)
      VALUES (?, ?, ?)
      `,
      [id, phoneNumber, otp],
    );
    otpAttemptStore.delete(phoneNumber);

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
      [userId],
    );

    const [[activeMatch]] = await db.query(
      `
      SELECT 1 FROM matches
      WHERE (user_id = ? OR other_user_id = ?)
        AND unmatched = 0
      LIMIT 1
      `,
      [userId, userId],
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
