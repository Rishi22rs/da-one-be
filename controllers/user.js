const db = require("../db");

exports.addUserInfo = async (req, res) => {
  try {
    const { name, birthday, gender, orientation, passions, current_step } =
      req.body || {};
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const sql = `
      UPDATE user
      SET name = ?, birthday = ?, gender = ?, orientation = ?, passions = ?, current_step = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [
      name,
      birthday,
      gender,
      orientation,
      passions,
      current_step,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User info updated successfully" });
  } catch (err) {
    console.error("addUserInfo error:", err);
    return res.status(500).json({ message: "Failed to update user info" });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sql = `
      SELECT
        id,
        phone_number,
        name,
        bio,
        birthday,
        gender,
        orientation,
        passions,
        current_step
      FROM user
      WHERE id = ?
    `;

    const [rows] = await db.query(sql, [userId]);

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error("getUserInfo error:", err);
    return res.status(500).json({ message: "Failed to fetch user info" });
  }
};

exports.updateUserLocation = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude required" });
    }

    const sql = `
      UPDATE user
      SET latitude = ?, longitude = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [latitude, longitude, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("updateUserLocation error:", err);
    return res.status(500).json({ message: "Failed to update location" });
  }
};

exports.getLikesReceived = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sql = `
      SELECT u.*
      FROM like_and_dislikes l
      JOIN user u ON l.user_id = u.id
      WHERE l.other_user_id = ?
        AND l.is_like = 1
        AND l.is_deleted != 1
    `;

    const [rows] = await db.query(sql, [userId]);

    return res.status(200).json({
      count: rows.length,
      users: rows,
    });
  } catch (err) {
    console.error("getLikesReceived error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
