const { default: axios } = require("axios");
const db = require("../db");
const { generateToken } = require("../middlewares/auth");
const { getId } = require("../utils/getId");

exports.addUserInfo = (req, res) => {
  const { name, birthday, gender, orientation, passions, current_step } =
    req.body;
  const userId = req.user?.id; // assuming you're attaching user info to req in some auth middleware
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
