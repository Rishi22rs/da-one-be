require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Create HTTP server from Express
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this in production
    methods: ["GET", "POST"],
  },
});

const port = 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api", require("./routes/auth.js"));
app.use("/api", require("./routes/user.js"));
app.use("/api", require("./routes/match.js"));

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ userId, otherUserId }) => {
    const room = [userId, otherUserId].sort().join("_");
    socket.join(room);
  });

  socket.on("leaveRoom", ({ userId, otherUserId }) => {
    const room = [userId, otherUserId].sort().join("_");
    socket.leave(room);
  });

  socket.on("sendMessage", (message) => {
    console.log("📨 Message received:", message);
    const room = [message.from, message.to].sort().join("_");
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
