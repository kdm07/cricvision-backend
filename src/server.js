const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const config = require("./config/env");
const db = require("./database/models");

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: config.frontendUrl, credentials: true },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connection established");

    await db.sequelize.sync();
    console.log("Database synced");

    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
