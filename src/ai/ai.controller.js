"use strict";

const aiService = require("./ai.service");
const { ApiError } = require("../utils/apiError");
// const ApiError = require("../utils/apiError");


/**
 * ai.controller.js
 * ----------------------------------------------------------------------------
 * HTTP layer for the AI Coach. Every handler here assumes `authenticate`
 * JWT middleware has already run and populated `req.user` (see auth.js /
 * auth.controller.js pattern already in the codebase) — no endpoint in this
 * file should ever be reachable by an unauthenticated request.
 *
 * Controllers stay thin: validate/extract input, delegate to ai.service,
 * translate results/errors into HTTP responses. No business logic here.
 */

/**
 * Centralized error responder so every handler below reports errors the
 * same way, whether they're expected (ApiError) or unexpected.
 */
function respondWithError(res, err, fallbackMessage) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(fallbackMessage, err);
  return res
    .status(500)
    .json({ error: "Something went wrong, please try again" });
}

/**
 * POST /api/ai/chat
 * Body: { message: string, conversationId?: number }
 */
async function chat(req, res) {
  try {
    const { message, conversationId } = req.body;

    console.log("Received chat request:", {
      userId: req.user.id,
      message,
      conversationId,
    });

    const result = await aiService.sendChatMessage(
      req.user.id,
      message,
      conversationId ?? null,
    );

    return res.status(200).json({
      conversation: {
        id: result.conversation.id,
        title: result.conversation.title,
      },
      userMessage: {
        id: result.userMessage.id,
        role: result.userMessage.role,
        content: result.userMessage.content,
        createdAt: result.userMessage.createdAt,
      },
      assistantMessage: {
        id: result.assistantMessage.id,
        role: result.assistantMessage.role,
        content: result.assistantMessage.content,
        createdAt: result.assistantMessage.createdAt,
      },
    });
  } catch (err) {
    //   catch (err) {
    //     return respondWithError(res, err, "AI chat error:");
    //   }

    console.error("Original error:");
    console.error(err);
    console.error(err.stack);

    return res.status(500).json({
      error: err.message,
    });
  }

}

/**
 * GET /api/ai/conversations
 */
async function listConversations(req, res) {
  try {
    const conversations = await aiService.getConversations(req.user.id);

    return res.status(200).json({
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        messageCount: Number(c.get("messageCount")) || 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (err) {
    return respondWithError(res, err, "List conversations error:");
  }
}

/**
 * GET /api/ai/conversations/:id
 */
async function getConversation(req, res) {
  try {
    const conversationId = Number(req.params.id);
    if (!Number.isInteger(conversationId)) {
      throw new ApiError(400, "Invalid conversation id.");
    }

    const conversation = await aiService.getConversationById(
      req.user.id,
      conversationId,
    );

    return res.status(200).json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (err) {
    return respondWithError(res, err, "Get conversation error:");
  }
}

/**
 * DELETE /api/ai/conversations/:id
 */
async function deleteConversation(req, res) {
  try {
    const conversationId = Number(req.params.id);
    if (!Number.isInteger(conversationId)) {
      throw new ApiError(400, "Invalid conversation id.");
    }

    await aiService.deleteConversation(req.user.id, conversationId);

    return res.status(200).json({ success: true });
  } catch (err) {
    return respondWithError(res, err, "Delete conversation error:");
  }
}

/**
 * POST /api/ai/suggested-prompts
 * (POST rather than GET since it may eventually accept a body, e.g. to
 * scope suggestions to a specific conversation's topic — currently unused.)
 */
async function suggestedPrompts(req, res) {
  try {
    const prompts = await aiService.getSuggestedPrompts(req.user.id);
    return res.status(200).json({ prompts });
  } catch (err) {
    return respondWithError(res, err, "Suggested prompts error:");
  }
}

module.exports = {
  chat,
  listConversations,
  getConversation,
  deleteConversation,
  suggestedPrompts,
};
