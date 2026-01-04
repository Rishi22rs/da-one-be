const db = require("../db");

exports.getUserAlerts = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sql = `
      SELECT *
      FROM alerts
      WHERE user_id = ?
        AND isRead != 1
    `;

    const [results] = await db.query(sql, [userId]);

    return res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.markAlertsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sql = `
      UPDATE alerts
      SET isRead = 1
      WHERE user_id = ?
    `;

    await db.query(sql, [userId]);

    return res.status(200).json({ message: "Alerts marked as read" });
  } catch (err) {
    console.error("Error updating alerts:", err);
    return res.status(500).json({ message: "Database update error" });
  }
};
