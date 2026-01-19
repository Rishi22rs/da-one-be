const db = require("../db");
const { calculateAge } = require("../utils/calculateAge");
const { getId } = require("../utils/getId");

exports.getNearbyUsers = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10000000,
      offset = 0,
      limit = 100,
    } = req.body || {};

    const currentUserId = req.user?.id;

    if (!latitude || !longitude || !currentUserId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* 🔒 BLOCK if user is already matched */
    const [[locked]] = await db.query(
      `
      SELECT 1 FROM matches
      WHERE (user_id = ? OR other_user_id = ?)
        AND unmatched = 0
      LIMIT 1
      `,
      [currentUserId, currentUserId],
    );

    if (locked) {
      return res.status(200).json([]);
    }

    const [[config]] = await db.query(
      `SELECT swipes FROM user_config WHERE user_id = ?`,
      [currentUserId],
    );

    if (!config || config.swipes < 1) {
      return res.status(200).json([]);
    }

    const getUserLimit = Math.min(config.swipes, limit);

    const [rows] = await db.query(
      `
      SELECT *
      FROM (
        SELECT u.*,
          (
            6371 * ACOS(
              COS(RADIANS(?)) * COS(RADIANS(u.latitude)) *
              COS(RADIANS(u.longitude) - RADIANS(?)) +
              SIN(RADIANS(?)) * SIN(RADIANS(u.latitude))
            )
          ) AS distance
        FROM user u
        WHERE u.latitude IS NOT NULL
          AND u.longitude IS NOT NULL
          AND u.id != ?
      ) calculated
      WHERE distance <= ?

      -- exclude already swiped
      AND NOT EXISTS (
        SELECT 1 FROM like_and_dislikes ld
        WHERE ld.user_id = ?
          AND ld.other_user_id = calculated.id
          AND ld.is_deleted != 1
      )

      -- exclude locked users
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE (m.user_id = calculated.id OR m.other_user_id = calculated.id)
          AND m.unmatched = 0
      )

      ORDER BY distance
      LIMIT ? OFFSET ?
      `,
      [
        latitude,
        longitude,
        latitude,
        currentUserId,
        radius,
        currentUserId,
        getUserLimit,
        offset,
      ],
    );

    const finalResult = rows.map((item) => ({
      userId: item.id,
      segregatedList: [
        {
          type: "BIG_TEXT",
          title: "Name & Age",
          content: `${item.name}, ${calculateAge(item.birthday)}`,
        },
        item.bio && {
          type: "SMALL_TEXT",
          title: "Bio",
          content: item.bio,
        },
        {
          type: "SMALL_TEXT_LIST",
          title: "Essentials",
          content: [
            {
              title: "Distance",
              value: `${Math.floor(item.distance)} km away`,
            },
            { title: "Height", value: item.height },
            { title: "Orientation", value: item.orientation },
            { title: "Gender", value: item.gender },
            { title: "Languages", value: item.languages },
          ].filter(Boolean),
        },
        {
          type: "SMALL_TEXT",
          title: "Passions",
          content: item.passions,
        },
        item.job && {
          type: "SMALL_TEXT",
          title: "Job",
          content: item.job,
        },
      ].filter(Boolean),
    }));

    return res.status(200).json(finalResult);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching nearby users" });
  }
};

exports.addLikeOrDislike = async (req, res) => {
  const { other_user_id, is_like } = req.body;
  const userId = req.user?.id;

  if (!userId || !other_user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    /* 1️⃣ Check if already matched (1-on-1 lock) */
    const [matchRows] = await conn.query(
      `
      SELECT 1
      FROM matches
      WHERE (
        user_id = ? OR other_user_id = ?
      )
      AND unmatched = 0
      LIMIT 1
      `,
      [userId, userId],
    );

    if (matchRows.length) {
      await conn.rollback();
      return res.status(200).json({ matched: true });
    }

    /* 2️⃣ Check swipes */
    const [[config]] = await conn.query(
      `SELECT swipes FROM user_config WHERE user_id = ?`,
      [userId],
    );

    if (!config || config.swipes < 1) {
      await conn.rollback();
      return res.status(403).json({ message: "No swipes left" });
    }

    /* 3️⃣ Check if other user already liked me */
    const [mutualLike] = await conn.query(
      `
      SELECT 1
      FROM like_and_dislikes
      WHERE user_id = ?
        AND other_user_id = ?
        AND is_like = 1
        AND is_deleted != 1
      LIMIT 1
      `,
      [other_user_id, userId],
    );

    if (mutualLike.length && is_like) {
      /* 🎉 MATCH */
      const matchId = getId();

      await conn.query(
        `
        INSERT INTO matches (id, user_id, other_user_id)
        VALUES (?, ?, ?)
        `,
        [matchId, userId, other_user_id],
      );

      await conn.query(
        `
        UPDATE like_and_dislikes
        SET is_deleted = 1
        WHERE (user_id = ? AND other_user_id = ?)
           OR (user_id = ? AND other_user_id = ?)
        `,
        [userId, other_user_id, other_user_id, userId],
      );

      await conn.query(
        `UPDATE user_config SET swipes = swipes - 1 WHERE user_id = ?`,
        [userId],
      );

      await conn.commit();
      return res.status(200).json({
        matched: true,
        matchedUserId: other_user_id,
      });
    }

    /* 4️⃣ Normal like/dislike */
    await conn.query(
      `
      INSERT INTO like_and_dislikes (id, user_id, other_user_id, is_like)
      SELECT ?, ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM like_and_dislikes
        WHERE user_id = ? AND other_user_id = ?
      )
      `,
      [getId(), userId, other_user_id, is_like, userId, other_user_id],
    );

    await conn.query(
      `UPDATE user_config SET swipes = swipes - 1 WHERE user_id = ?`,
      [userId],
    );

    await conn.commit();
    return res.status(200).json({
      matched: false,
      liked: is_like,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Swipe failed:", err);
    return res.status(500).json({ message: "Swipe failed" });
  } finally {
    if (conn) conn.release();
  }
};

// exports.addLikeOrDislike = (req, res) => {
//   const { other_user_id, is_like } = req.body;
//   const userId = req.user?.id;

//   if (!userId || !other_user_id) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   const id = getId();

//   // Step 1: Check if the user is already in a match table
//   const checkMatchSql = `SELECT other_user_id
//   FROM matches
//   WHERE (other_user_id = ? OR user_id = ?) AND UNMATCHED != 1
//   `;

//   db.query(checkMatchSql, [userId, userId], (checkErr, matchResult) => {
//     if (checkErr) {
//       console.error("Error checking for match:", checkErr);
//       return res.status(500).json({ message: "Error checking for match" });
//     }
//     const otherUserId = matchResult?.[0]?.other_user_id;
//     if (matchResult.length > 0) {
//       const deleteUserIdsAndOtherUserIdsSql =
//         "UPDATE like_and_dislikes SET is_deleted = 1 WHERE (user_id = ? OR other_user_id = ? OR user_id = ? OR other_user_id = ?)";
//       db.query(
//         deleteUserIdsAndOtherUserIdsSql,
//         [userId, userId, otherUserId, otherUserId],
//         (deleteErr) => {
//           if (deleteErr) {
//             console.error("Error deleting user IDs:", deleteErr);
//             return res.status(500).json({ message: "Error deleting user IDs" });
//           }
//         }
//       );
//       return res
//         .status(200)
//         .json({ message: "Match created successfully", match: true });
//     } else {
//       const checkSwipesSql = `SELECT swipes FROM user_config WHERE user_id = ?`;
//       db.query(checkSwipesSql, [userId], (err, results) => {
//         if (err) {
//           console.error("Error checking swipes:", err);
//           return res.status(500).json({ message: "Error checking swipes" });
//         }

//         const swipes = results?.[0]?.swipes || 0;
//         if (swipes < 1) {
//           return res
//             .status(403)
//             .json({ message: "No swipes left", canSwipe: false });
//         }

//         // Step 2: check if other_user_id already liked then insert in match table

//         // Step 3: Insert like/dislike if not exists
//         const insertSql = `
//       INSERT INTO like_and_dislikes (id, user_id, other_user_id, is_like)
//       SELECT ?, ?, ?, ?
//       WHERE NOT EXISTS (
//         SELECT 1 FROM like_and_dislikes WHERE user_id = ? AND other_user_id = ?
//       )
//     `;

//         db.query(
//           insertSql,
//           [id, userId, other_user_id, is_like, userId, other_user_id],
//           (insertErr, insertResult) => {
//             if (insertErr) {
//               console.error("Error inserting like/dislike:", insertErr);
//               return res.status(500).json({ message: "Insert failed" });
//             }

//             if (insertResult.affectedRows === 0) {
//               return res
//                 .status(409)
//                 .json({ message: "Already liked/disliked" });
//             }

//             // Step 3: Decrease swipes by 1
//             const updateSwipesSql = `UPDATE user_config SET swipes = swipes - 1 WHERE user_id = ?`;
//             db.query(updateSwipesSql, [userId], (updateErr) => {
//               if (updateErr) {
//                 console.error("Error updating swipes:", updateErr);
//                 return res.status(500).json({ message: "Swipe update failed" });
//               }

//               return res.status(200).json({ message: "Interaction recorded" });
//             });
//           }
//         );
//       });
//     }
//   });
// };

exports.unmatch = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Mark match as unmatched
    const [result] = await conn.query(
      `
      UPDATE matches
      SET unmatched = 1
      WHERE (user_id = ? OR other_user_id = ?)
        AND unmatched = 0
      `,
      [userId, userId],
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "No active match found" });
    }

    // OPTIONAL: soft-delete likes instead of delete (better for trust score)
    await conn.query(
      `
      UPDATE like_and_dislikes
      SET is_deleted = 1
      WHERE user_id = ? OR other_user_id = ?
      `,
      [userId, userId],
    );

    await conn.commit();
    return res.status(200).json({ message: "Unmatched successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("Unmatch error:", err);
    return res.status(500).json({ message: "Unmatch failed" });
  } finally {
    conn.release();
  }
};

exports.getMatchedUserData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID missing" });
    }

    const [[match]] = await db.query(
      `
      SELECT
        CASE
          WHEN user_id = ? THEN other_user_id
          ELSE user_id
        END AS matched_user_id
      FROM matches
      WHERE (user_id = ? OR other_user_id = ?)
        AND unmatched = 0
      LIMIT 1
      `,
      [userId, userId, userId],
    );

    if (!match) {
      return res.status(404).json({ error: "No active match found" });
    }

    const [[user]] = await db.query(`SELECT * FROM user WHERE id = ?`, [
      match.matched_user_id,
    ]);

    if (!user) {
      return res.status(404).json({ error: "Matched user not found" });
    }

    const segregatedList = [
      {
        type: "BIG_TEXT",
        title: "Name & Age",
        content: `${user.name}, ${calculateAge(user.birthday)}`,
      },
      user.bio && {
        type: "SMALL_TEXT",
        title: "Bio",
        content: user.bio,
      },
      {
        type: "SMALL_TEXT_LIST",
        title: "Essentials",
        content: [
          { title: "Height", value: user.height },
          { title: "Orientation", value: user.orientation },
          { title: "Gender", value: user.gender },
          { title: "Languages", value: user.languages },
        ].filter(Boolean),
      },
      {
        type: "SMALL_TEXT",
        title: "Passions",
        content: user.passions,
      },
      user.job && {
        type: "SMALL_TEXT",
        title: "Job",
        content: user.job,
      },
    ].filter(Boolean);

    return res.status(200).json(segregatedList);
  } catch (err) {
    console.error("getMatchedUserData error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMatchedUserIds = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID missing" });
    }

    const [[match]] = await db.query(
      `
      SELECT user_id, other_user_id
      FROM matches
      WHERE (user_id = ? OR other_user_id = ?)
        AND unmatched = 0
      LIMIT 1
      `,
      [userId, userId],
    );

    if (!match) {
      return res.status(404).json({ error: "No active match" });
    }

    if (match.user_id !== userId) {
      [match.user_id, match.other_user_id] = [
        match.other_user_id,
        match.user_id,
      ];
    }

    return res.status(200).json(match);
  } catch (err) {
    console.error("getMatchedUserIds error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkIfMatched = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sql = `
      SELECT 
        CASE 
          WHEN user_id = ? THEN other_user_id 
          ELSE user_id 
        END AS matchedUserId
      FROM matches
      WHERE (user_id = ? OR other_user_id = ?)
        AND unmatched != 1
    `;

    const [rows] = await db.query(sql, [userId, userId, userId]);

    return res.status(200).json({
      matched: rows.length > 0,
      matchedUserIds: rows.map((r) => r.matchedUserId),
    });
  } catch (err) {
    console.error("Error checking match:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
