const jwt = require("jsonwebtoken");
const db = require("./db");

const extractToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return String(authToken).replace(/^Bearer\s+/i, "");

  const authHeader = socket.handshake?.headers?.authorization;
  if (authHeader) return String(authHeader).replace(/^Bearer\s+/i, "");

  const queryToken = socket.handshake?.query?.token;
  if (queryToken) return String(queryToken).replace(/^Bearer\s+/i, "");

  return "";
};

const getRoomName = (userId, otherUserId) =>
  [userId, otherUserId].sort().join("_");

const isMatched = async (userId, otherUserId) => {
  const [[match]] = await db.query(
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
    [userId, otherUserId, otherUserId, userId],
  );

  return !!match;
};

exports.initSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error("Unauthorized: token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) {
        return next(new Error("Unauthorized: invalid token payload"));
      }

      socket.data.userId = decoded.id;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const authUserId = socket.data.userId;
    console.log("User connected:", socket.id, "userId:", authUserId);

    socket.on("joinRoom", async ({ userId, otherUserId } = {}) => {
      try {
        if (!otherUserId) {
          console.log("Invalid joinRoom payload", { userId, otherUserId });
          return;
        }

        if (userId && userId !== authUserId) {
          console.log("joinRoom identity mismatch", {
            claimedUserId: userId,
            authUserId,
          });
          return;
        }

        const allowed = await isMatched(authUserId, otherUserId);
        if (!allowed) {
          console.log("joinRoom denied: users not matched", {
            authUserId,
            otherUserId,
          });
          return;
        }

        const room = getRoomName(authUserId, otherUserId);
        socket.join(room);
        console.log("Joined room:", { authUserId, otherUserId, room });
      } catch (err) {
        console.error("joinRoom error:", err);
      }
    });

    socket.on("leaveRoom", ({ userId, otherUserId } = {}) => {
      if (!otherUserId) {
        console.log("Invalid leaveRoom payload", { userId, otherUserId });
        return;
      }

      if (userId && userId !== authUserId) {
        console.log("leaveRoom identity mismatch", {
          claimedUserId: userId,
          authUserId,
        });
        return;
      }

      const room = getRoomName(authUserId, otherUserId);
      console.log("Leaving room:", { authUserId, otherUserId, room });
      socket.leave(room);
    });

    socket.on("sendMessage", async (message = {}) => {
      try {
        const receiverId = message.receiverId || message.recieverId;
        if (!receiverId) {
          console.log("Invalid sendMessage payload", message);
          return;
        }

        if (message.senderId && message.senderId !== authUserId) {
          console.log("sendMessage identity mismatch", {
            claimedSenderId: message.senderId,
            authUserId,
          });
          return;
        }

        const allowed = await isMatched(authUserId, receiverId);
        if (!allowed) {
          console.log("sendMessage denied: users not matched", {
            authUserId,
            receiverId,
          });
          return;
        }

        const room = getRoomName(authUserId, receiverId);
        console.log("Message received:", {
          senderId: authUserId,
          receiverId,
          room,
        });

        io.to(room).emit("receiveMessage", {
          ...message,
          senderId: authUserId,
          receiverId,
        });
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id, "userId:", authUserId);
    });
  });
};
