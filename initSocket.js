exports.initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", ({ userId, otherUserId }) => {
      console.log({
        userId,
        otherUserId,
        sorted: [userId, otherUserId].sort().join("_"),
      });
      const room = [userId, otherUserId].sort().join("_");
      socket.join(room);
    });

    socket.on("leaveRoom", ({ userId, otherUserId }) => {
      console.log("📨 Leaving room:", message);
      const room = [userId, otherUserId].sort().join("_");
      socket.leave(room);
    });

    socket.on("sendMessage", (message) => {
      console.log("📨 Message received:", message);
      const room = [message.senderId, message.recieverId].sort().join("_");
      io.to(room).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
