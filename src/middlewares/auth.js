const jwt = require("jsonwebtoken");
const config = require("../config/env");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, config.jwt.secret); // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticate };
