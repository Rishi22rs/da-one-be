require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./initSocket.js");

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
app.use("/api", require("./routes/chat.js"));

// Socket.IO logic
initSocket(io);

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
