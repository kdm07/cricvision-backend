"use strict";

const express = require("express");
const router = express.Router();

const aiController = require("./ai.controller");
const { authenticate } = require("../middlewares/auth");
const { chatValidator } = require("./ai.validator");

/**
 * ai.routes.js
 * ----------------------------------------------------------------------------
 * Route definitions for the AI Coach module. Mirrors the existing
 * auth.routes.js pattern: every route is wired through the shared
 * `authenticate` JWT middleware — no AI Coach endpoint is reachable without
 * a valid token. Mount this router in app.js as:
 *
 *   app.use('/api/ai', aiRoutes);
 */

// POST /api/ai/chat
router.post("/chat", authenticate, chatValidator, aiController.chat);

// GET /api/ai/conversations
router.get("/conversations", authenticate, aiController.listConversations);

// GET /api/ai/conversations/:id
router.get("/conversations/:id", authenticate, aiController.getConversation);

// DELETE /api/ai/conversations/:id
router.delete(
  "/conversations/:id",
  authenticate,
  aiController.deleteConversation,
);

// POST /api/ai/suggested-prompts
router.post("/suggested-prompts", authenticate, aiController.suggestedPrompts);

module.exports = router;
