const db = require("../db"); // adjust path to your db connection file
const { getId } = require("../utils/getId");

exports.addChatMessage = (req, res) => {
  const userId = req.user?.id;
  const { toId, message } = req.body;

  if (!userId || !toId || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const id = getId();
  const insertSql = `
    INSERT INTO chats (id, from_id, to_id, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertSql, [id, userId, toId, message], (err, result) => {
    if (err) {
      console.error("Error inserting chat message:", err);
      return res.status(500).json({ message: "Failed to add message" });
    }

    return res.status(200).json({
      message: "Message added successfully",
    });
  });
};

exports.getChatsBetweenUsers = (req, res) => {
  const userId = req.user?.id;
  const { otherUserId } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).json({ message: "Missing userId or otherUserId" });
  }

  const sql = `
      SELECT id, from_id, to_id, message, timestamp 
      FROM chats 
      WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
      ORDER BY timestamp ASC
    `;

  db.query(sql, [userId, otherUserId, otherUserId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching chats:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map((chat) => ({
      id: chat.id,
      text: chat.message,
      time: new Date(chat.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: chat.from_id === userId ? "me" : "other",
      senderId: chat.from_id,
    }));

    return res.status(200).json(formatted);
  });
};
