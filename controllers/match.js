const db = require("../db");
const { calculateAge } = require("../utils/calculateAge");
const { getId } = require("../utils/getId");

exports.getNearbyUsers = (req, res) => {
  const { latitude, longitude, radius } = req.body || {};
  const sql = `SELECT * FROM (SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance FROM user WHERE latitude IS NOT NULL AND longitude IS NOT NULL) AS calculated WHERE distance <= 10000 AND id != ? ORDER BY distance`;
  const currentUserId = req.user?.id;

  db.query(sql, [latitude, longitude, radius, currentUserId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching nearby users:", err });
    } else {
      let finalResult = result?.map((item) => {
        let segregatedList = [];
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
        return { userId: item?.id, segregatedList };
      });
      return res.status(200).json(finalResult);
    }
  });
};

exports.addLikeOrDislike = (req, res) => {
  const { other_user_id } = req.body;
  const userId = req.user?.id;

  if (!userId || !other_user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const id = getId();

  // Step 1: Check if other_user already liked the current user
  const checkMatchSql = `
    SELECT 1 FROM like_and_dislikes 
    WHERE other_user_id = ? AND user_id = ?
  `;

  db.query(checkMatchSql, [userId, other_user_id], (checkErr, matchResult) => {
    if (checkErr) {
      console.error("Error checking for match:", checkErr);
      return res.status(500).json({ message: "Error checking for match" });
    }

    if (matchResult.length > 0) {
      // Match found - insert into matches table if it doesn't exist
      const matchId = getId();
      const insertMatchSql = `
        INSERT INTO matches (id, user_id, other_user_id)
        SELECT ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM matches WHERE user_id = ? AND other_user_id = ?
        )
      `;

      db.query(
        insertMatchSql,
        [matchId, userId, other_user_id, userId, other_user_id],
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
      // No match yet - insert like/dislike if not already existing
      const insertSql = `
        INSERT INTO like_and_dislikes (id, user_id, other_user_id)
        SELECT ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM like_and_dislikes WHERE user_id = ? AND other_user_id = ?
        )
      `;

      db.query(
        insertSql,
        [id, userId, other_user_id, userId, other_user_id],
        (error, result) => {
          if (error) {
            console.error("Error inserting like/dislike:", error);
            return res.status(500).json({ message: "Database insert failed" });
          }

          if (result.affectedRows === 0) {
            return res
              .status(409)
              .json({ message: "Interaction already exists", match: false });
          }

          return res
            .status(200)
            .json({ message: "Interaction saved successfully", match: false });
        }
      );
    }
  });
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
