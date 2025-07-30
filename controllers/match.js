const db = require("../db");
const { calculateAge } = require("../utils/calculateAge");
const { getId } = require("../utils/getId");

exports.getNearbyUsers = (req, res) => {
  const {
    latitude,
    longitude,
    radius = 1000000,
    offset = 0,
    getUserLimit = 100,
  } = req.body || {};

  const currentUserId = req.user?.id;

  if (!latitude || !longitude || !currentUserId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const swipeSql = `SELECT swipes FROM user_config WHERE user_id = ?`;

  db.query(swipeSql, [currentUserId], (swipeErr, swipeRes) => {
    if (swipeErr) {
      return res.status(500).json({ message: "Failed to fetch swipe data" });
    }

    const swipesLeft = swipeRes?.[0]?.swipes || 0;

    if (swipesLeft < 1) {
      return res.status(200).json([]); // No swipes left
    }

    const limit = Math.min(swipesLeft, getUserLimit);

    const sql = `
      SELECT * FROM (
        SELECT *,
          (
            6371 * ACOS(
              COS(RADIANS(?)) * COS(RADIANS(latitude)) *
              COS(RADIANS(longitude) - RADIANS(?)) +
              SIN(RADIANS(?)) * SIN(RADIANS(latitude))
            )
          ) AS distance
        FROM user
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND id != ?
      ) AS calculated
      WHERE distance <= ?
        AND NOT EXISTS (
          SELECT 1 FROM like_and_dislikes
          WHERE user_id = ? AND other_user_id = calculated.id
        )
      ORDER BY distance
      LIMIT ? OFFSET ?;
    `;

    const values = [
      latitude,
      longitude,
      latitude,
      currentUserId,
      radius,
      currentUserId,
      limit,
      offset,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching nearby users", err });
      }

      const finalResult = result.map((item) => {
        const segregatedList = [];

        segregatedList.push({
          type: "BIG_TEXT",
          title: "Name & Age",
          content: `${item?.name}, ${calculateAge(item?.birthday)}`,
        });

        if (item?.bio) {
          segregatedList.push({
            type: "SMALL_TEXT",
            title: "Bio",
            content: item.bio,
          });
        }

        segregatedList.push({
          type: "SMALL_TEXT_LIST",
          title: "Essentials",
          content: [
            {
              title: "Distance",
              value: `${Math.floor(item?.distance)} km away`,
            },
            { title: "Height", value: item?.height },
            { title: "Orientation", value: item?.orientation },
            { title: "Gender", value: item?.gender },
            { title: "Languages", value: item?.languages },
          ].filter((entry) => entry.value || entry.value === 0),
        });

        segregatedList.push({
          type: "SMALL_TEXT",
          title: "Passions",
          content: item?.passions,
        });

        if (item?.job) {
          segregatedList.push({
            type: "SMALL_TEXT",
            title: "Job",
            content: item.job,
          });
        }

        return { userId: item?.id, segregatedList };
      });

      return res.status(200).json(finalResult);
    });
  });
};

exports.addLikeOrDislike = (req, res) => {
  const { other_user_id, is_like } = req.body;
  const userId = req.user?.id;

  console.log(userId, other_user_id, is_like);

  if (!userId || !other_user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const id = getId();

  // Step 1: Check if other_user already liked the current user
  const checkMatchSql = `
  SELECT 1 
  FROM like_and_dislikes 
  WHERE other_user_id = ? AND user_id = ? AND is_like = 1
  UNION
  SELECT 1 
  FROM matches 
  WHERE other_user_id = ?
  `;

  db.query(
    checkMatchSql,
    [userId, other_user_id, userId],
    (checkErr, matchResult) => {
      if (checkErr) {
        console.error("Error checking for match:", checkErr);
        return res.status(500).json({ message: "Error checking for match" });
      }

      if (matchResult.length > 0) {
        const matchId = getId();
        const insertMatchSql = `
        INSERT INTO like_and_dislikes (id, user_id, other_user_id,is_like)
        SELECT ?, ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM like_and_dislikes WHERE user_id = ? AND other_user_id = ?
        );
        INSERT INTO matches (id, user_id, other_user_id)
        SELECT ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM matches WHERE user_id = ? AND other_user_id = ?
        );
      `;

        db.query(
          insertMatchSql,
          [
            id,
            userId,
            other_user_id,
            is_like,
            userId,
            other_user_id,
            matchId,
            userId,
            other_user_id,
            userId,
            other_user_id,
          ],
          (matchErr, matchResult) => {
            if (matchErr) {
              console.error("Error inserting match:", matchErr);
              return res.status(500).json({ message: "Error inserting match" });
            }

            return res
              .status(200)
              .json({ message: "Match created successfully", match: true });
          }
        );
      } else {
        const checkSwipesSql = `SELECT swipes FROM user_config WHERE user_id = ?`;
        db.query(checkSwipesSql, [userId], (err, results) => {
          if (err) {
            console.error("Error checking swipes:", err);
            return res.status(500).json({ message: "Error checking swipes" });
          }

          const swipes = results?.[0]?.swipes || 0;
          if (swipes < 1) {
            return res
              .status(403)
              .json({ message: "No swipes left", canSwipe: false });
          }

          // Step 2: Insert like/dislike if not exists
          const insertSql = `
      INSERT INTO like_and_dislikes (id, user_id, other_user_id, is_like)
      SELECT ?, ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM like_and_dislikes WHERE user_id = ? AND other_user_id = ?
      )
    `;

          db.query(
            insertSql,
            [id, userId, other_user_id, is_like, userId, other_user_id],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error("Error inserting like/dislike:", insertErr);
                return res.status(500).json({ message: "Insert failed" });
              }

              if (insertResult.affectedRows === 0) {
                return res
                  .status(409)
                  .json({ message: "Already liked/disliked" });
              }

              // Step 3: Decrease swipes by 1
              const updateSwipesSql = `UPDATE user_config SET swipes = swipes - 1 WHERE user_id = ?`;
              db.query(updateSwipesSql, [userId], (updateErr) => {
                if (updateErr) {
                  console.error("Error updating swipes:", updateErr);
                  return res
                    .status(500)
                    .json({ message: "Swipe update failed" });
                }

                return res
                  .status(200)
                  .json({ message: "Interaction recorded" });
              });
            }
          );
        });
      }
    }
  );
};

exports.unmatch = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  db.getConnection((err, connection) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error getting DB connection", err });
    }

    connection.beginTransaction((err) => {
      if (err)
        return res.status(500).json({ message: "Transaction start failed" });

      const updateMatchesSql = `
      UPDATE matches 
      SET unmatched = 1 
      WHERE user_id = ? OR other_user_id = ?
    `;

      const deleteLikesSql = `
      DELETE FROM like_and_dislikes 
      WHERE user_id = ?
    `;

      connection.query(updateMatchesSql, [userId, userId], (updateErr) => {
        if (updateErr) {
          return connection.rollback(() => {
            res.status(500).json({ message: "Failed to update matches" });
          });
        }

        connection.query(deleteLikesSql, [userId], (deleteErr) => {
          if (deleteErr) {
            return connection.rollback(() => {
              res.status(500).json({ message: "Failed to delete likes" });
            });
          }

          connection.commit((commitErr) => {
            if (commitErr) {
              return db.rollback(() => {
                res.status(500).json({ message: "Transaction commit failed" });
              });
            }

            return res
              .status(200)
              .json({ message: "Unmatched and cleaned up successfully" });
          });
        });
      });
    });
  });
};

exports.getMatchedUserData = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID missing from request" });
  }

  const matchQuery = `
    SELECT 
      CASE 
        WHEN user_id = ? THEN other_user_id 
        ELSE user_id 
      END AS matched_user_id
    FROM matches
    WHERE user_id = ? OR other_user_id = ?
    LIMIT 1
  `;

  db.query(matchQuery, [userId, userId, userId], (matchError, matchResult) => {
    if (matchError) {
      console.error("Error searching for a match", error);
      return res.status(500).json({ message: "Database search failed." });
    }
    if (!matchResult.length) {
      return res.status(404).json({ error: "No match found" });
    }

    const matchedUserId = matchResult[0].matched_user_id;

    return db.query(
      "SELECT * FROM user WHERE id = ?",
      [matchedUserId],
      (userError, userResult) => {
        if (userError) {
          console.error(userError);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!userResult.length) {
          return res.status(404).json({ error: "Matched user not found" });
        }

        let segregatedList = [];
        let item = userResult?.[0];
        segregatedList.push({
          type: "BIG_TEXT",
          title: "Name & Age",
          content: `${item?.name}, ${calculateAge(item?.birthday)}`,
        });
        !!item?.bio &&
          segregatedList.push({
            type: "SMALL_TEXT",
            title: "Bio",
            content: item?.bio,
          });
        segregatedList.push({
          type: "SMALL_TEXT_LIST",
          title: "Essentials",
          content: [
            {
              title: "Distance",
              value: `${Math.floor(item?.distance)} km away`,
            },
            { title: "Height", value: item?.height },
            { title: "Orientation", value: item?.orientation },
            { title: "Gender", value: item?.gender },
            { title: "Languages", value: item?.languages },
          ].filter((entry) => entry.value || entry.value === 0),
        });
        segregatedList.push({
          type: "SMALL_TEXT",
          title: "Passions",
          content: item?.passions,
        });
        {
          !!item?.job &&
            segregatedList.push({
              type: "SMALL_TEXT",
              title: "Job",
              content: item?.job,
            });
        }
        return res.status(200).json(segregatedList);
      }
    );
  });
};

exports.getMatchedUserIds = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID missing from request" });
  }

  const matchQuery = `
    SELECT 
      *
    FROM matches
    WHERE user_id = ? OR other_user_id = ?
    LIMIT 1
  `;

  db.query(matchQuery, [userId, userId], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!result.length) {
      return res.status(404).json({ error: "Matched user not found" });
    }
    if (userId !== result?.[0]?.user_id) {
      let tempId = result?.[0]?.user_id;
      result[0].user_id = result?.[0]?.other_user_id;
      result[0].other_user_id = tempId;
    }
    return res.status(200).json(result?.[0]);
  });
};

exports.checkIfMatched = (req, res) => {
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

  db.query(sql, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Error checking match:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const hasMatch = results.length > 0;

    return res.status(200).json({
      matched: hasMatch,
      matchedUserIds: results.map((r) => r.matchedUserId),
    });
  });
};
