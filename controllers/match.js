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
    WHERE other_user_id = ?
  `;

  db.query(checkMatchSql, [userId], (checkErr, matchResult) => {
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

  const sql = `
    UPDATE matches 
    SET unmatched = 1 
    WHERE user_id = ? OR other_user_id = ?
  `;

  db.query(sql, [userId, userId], (error, result) => {
    if (error) {
      console.error("Error updating unmatched status:", error);
      return res.status(500).json({ message: "Failed to unmatch user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No matches found for user" });
    }

    return res
      .status(200)
      .json({ message: "All matches unmatched successfully" });
  });
};
