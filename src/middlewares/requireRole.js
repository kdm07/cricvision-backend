"use strict";

/**
 * Usage: router.post("/", authenticate, requireRole(["admin", "analyst", "coach"]), handler)
 * Must run after `authenticate` so req.user is populated.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "You don't have permission to perform this action." });
    }
    next();
  };
}

module.exports = { requireRole };
