const { default: axios } = require("axios");
const db = require("../db");
const { generateToken } = require("../middlewares/auth");
const { getId } = require("../utils/getId");

const isNewUser = (phoneNumber) => {
  return new Promise((resolve, reject) => {
    const userDetailsExistsSql = `SELECT 1 FROM user WHERE phone_number=?`;
    db.query(userDetailsExistsSql, [phoneNumber], (error, result) => {
      if (error) reject({ message: "Somthing went wrong" });
      else resolve(!result?.length);
    });
  });
};

exports.verifyOtp = (req, res) => {
  const { phone_number: phoneNumber, otp } = req.query;
  const verifyPhoneNumberAndOtpSql = `SELECT 1 FROM user_phone_number_mapping WHERE phone_number=? AND otp=? LIMIT 1`;
  db.query(
    verifyPhoneNumberAndOtpSql,
    [phoneNumber, otp],
    async (error, result) => {
      if (error)
        return res
          .status(500)
          .json({ message: "Error while verifying OTP", error });
      if (result?.length) {
        const newUser = await isNewUser(phoneNumber);
        const newUserUid = getId();
        if (newUser) {
          const insertPhoneNumberSql = `INSERT INTO user (id,phone_number) VALUES (?,?)`;
          db.query(
            insertPhoneNumberSql,
            [newUserUid, phoneNumber],
            (insertPhoneNumberError) => {
              if (insertPhoneNumberError)
                return res
                  .status(500)
                  .json({ message: "Something went wrong", error });
              const deleteOtpSql = `DELETE FROM user_phone_number_mapping WHERE phone_number = ?`;
              db.query(
                deleteOtpSql,
                [phoneNumber],
                (deleteError, deleteResult) => {
                  if (deleteError)
                    return res
                      .status(500)
                      .json({ message: "Something went wrong" });
                  res.json({
                    message: "Phone number verified",
                    newUser,
                    token: generateToken({
                      id: newUserUid,
                      phoneNumber,
                    }),
                  });
                }
              );
            }
          );
        } else {
          const deleteOtpSql = `START TRANSACTION;DELETE FROM user_phone_number_mapping WHERE phone_number = ?;SELECT * FROM user WHERE phone_number=?;COMMIT;`;
          db.query(
            deleteOtpSql,
            [phoneNumber, phoneNumber],
            (deleteError, deleteResult) => {
              if (deleteError) {
                console.log(deleteError);
                return res
                  .status(500)
                  .json({ message: "Something went wrong" });
              }
              res.json({
                message: "Phone number verified",
                newUser,
                token: generateToken({
                  id: deleteResult?.[2]?.[0]?.id,
                  phoneNumber,
                }),
              });
            }
          );
        }
      } else res.status(401).json({ message: "Invalid OTP" });
    }
  );
};

exports.createOtp = (req, res) => {
  const id = getId();
  const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  const { phone_number: phoneNumber } = req.body;
  const addingPhoneNumberAndOtpSql = `INSERT INTO user_phone_number_mapping (id, phone_number,otp)
  VALUES (?,?,?) ON DUPLICATE KEY UPDATE otp=?`;
  //https://2factor.in/API/V1/34b58319-3cdf-11f0-a562-0200cd936042/SMS/+917843887864/6969/OTP1
  // axios
  //   .get(
  //     `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KET}&variables_values=${otp}&route=otp&numbers=${phoneNumber}`
  //   )
  //   .then(() => {
  axios
    .get(
      `https://2factor.in/API/V1/${process.env.FACTOR_API_KEY}/SMS/+91${phoneNumber}/${otp}/OTP1`
    )
    .then(() => {
      db.query(
        addingPhoneNumberAndOtpSql,
        [id, Number(phoneNumber), otp, otp],
        (error, result) => {
          if (error)
            return res
              .status(500)
              .json({ message: "Error while creating OTP", error });
          res.json({ message: "OTP created" });
        }
      );
    });
};

exports.currentStep = async (req, res) => {
  const userId = req.user?.id;
  let screenRoute = "onboarding";
  let screenName = "login-route";

  const isOnboardingDone = () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT 1 FROM user WHERE id = ? AND name IS NOT NULL AND name != '' LIMIT 1`;
      db.query(sql, [userId], (error, results) => {
        if (error) return reject(error);
        resolve(results.length > 0);
      });
    });
  };

  const doesUserExistInMatches = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 1 FROM matches 
        WHERE user_id = ? OR other_user_id = ?
        LIMIT 1
      `;

      db.query(sql, [userId, userId], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return reject(false);
        }
        resolve(result.length > 0);
      });
    });
  };

  const isOnboardingDoneResult = await isOnboardingDone();
  const doesUserExistInMatchesResult = await doesUserExistInMatches();

  console.log("doesUserExistInMatchesResult", doesUserExistInMatchesResult);

  if (isOnboardingDoneResult) {
    screenName = "bottom_tabs";
    screenRoute = "home";
  }
  if (doesUserExistInMatchesResult) {
    screenName = "match-route";
    screenRoute = "its-a-match";
  }

  res.json({
    message: "verified",
    route: screenRoute,
    routeName: screenName,
    user: req.user,
  });
};
