const db = require("../db");

exports.addUserInfo = (req, res) => {
  const { name, birthday, gender, orientation, passions, current_step } =
    req.body || {};
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const updateUserSql = `UPDATE user SET name=?, birthday=?, gender=?, orientation=?, passions=?, current_step=? WHERE id=?`;

  db.query(
    updateUserSql,
    [name, birthday, gender, orientation, passions, current_step, userId],
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Failed to update user info" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res
        .status(200)
        .json({ message: "User info updated successfully" });
    }
  );
};

exports.getUserInfo = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const getUserSql = `SELECT id, phone_number, name,bio, birthday, gender, orientation, passions, current_step FROM user WHERE id=?`;

  db.query(getUserSql, [userId], (error, result) => {
    if (error) {
      return res.status(500).json({ message: "Failed to fetch user info" });
    }

    if (!result.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const userInfo = result[0];
    return res.status(200).json({ data: userInfo });
  });
};

exports.updateUserLocation = (req, res) => {
  const userId = req.user?.id;
  const { latitude, longitude } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Unauthorized" });
  }

  const sql = `UPDATE user SET latitude = ?, longitude = ? WHERE id = ?`;

  db.query(sql, [latitude, longitude, userId], (error, result) => {
    if (error) {
      console.error("Error updating location:", error);
      return res.status(500).json({ message: "Failed to update location" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Location updated successfully" });
  });
};
