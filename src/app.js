const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const config = require("./config/env");

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan(config.env === "development" ? "dev" : "combined"));
// app.use(
//   cors({
//     origin: config.frontendUrl,
//     credentials: true,
//   }),
// );


app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — confirms the server is reachable before any routes exist
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const aiRoutes = require("./ai/ai.routes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

// Routes will be mounted here once controllers are built, e.g.:
// app.use("/api/players", require("./routes/player.routes"));

// Basic 404 + error handler so the app doesn't crash on bad requests
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

module.exports = app;
