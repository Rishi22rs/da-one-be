const db = require("../db"); // adjust path to your db connection file
const { getId } = require("../utils/getId");

exports.addChatMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { toId, message } = req.body;

    if (!userId || !toId || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* 🔒 IMPORTANT: Ensure users are actually matched */
    const [[activeMatch]] = await db.query(
      `
      SELECT 1
      FROM matches
      WHERE (
        (user_id = ? AND other_user_id = ?)
        OR (user_id = ? AND other_user_id = ?)
      )
      AND unmatched = 0
      LIMIT 1
      `,
      [userId, toId, toId, userId]
    );

    if (!activeMatch) {
      return res
        .status(403)
        .json({ message: "You are not matched with this user" });
    }

    const id = getId();

    await db.query(
      `
      INSERT INTO chats (id, from_id, to_id, message)
      VALUES (?, ?, ?, ?)
      `,
      [id, userId, toId, message]
    );

    return res.status(200).json({
      message: "Message added successfully",
    });
  } catch (err) {
    console.error("Error inserting chat message:", err);
    return res.status(500).json({ message: "Failed to add message" });
  }
};

exports.getChatsBetweenUsers = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "Missing userId or otherUserId" });
    }

    /* 🔒 Optional but recommended: validate match exists */
    const [[activeMatch]] = await db.query(
      `
      SELECT 1
      FROM matches
      WHERE (
        (user_id = ? AND other_user_id = ?)
        OR (user_id = ? AND other_user_id = ?)
      )
      AND unmatched = 0
      LIMIT 1
      `,
      [userId, otherUserId, otherUserId, userId]
    );

    if (!activeMatch) {
      return res.status(403).json({ message: "No active match found" });
    }

    const [results] = await db.query(
      `
      SELECT id, from_id, to_id, message, timestamp
      FROM chats
      WHERE (from_id = ? AND to_id = ?)
         OR (from_id = ? AND to_id = ?)
      ORDER BY timestamp ASC
      `,
      [userId, otherUserId, otherUserId, userId]
    );

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
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
