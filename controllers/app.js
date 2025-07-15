const db = require("../db");

exports.getUserAlerts = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `SELECT * FROM alerts WHERE user_id = ? AND isRead != 1`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching alerts:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(results);
  });
};

exports.markAlertsAsRead = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `UPDATE alerts SET isRead = 1 WHERE user_id = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error updating alerts:", err);
      return res.status(500).json({ message: "Database update error" });
    }

    return res.status(200).json({ message: "Alerts marked as read" });
  });
};
