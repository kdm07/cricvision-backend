"use strict";

const conversationRepository = require("./conversation.repository");
const promptBuilder = require("./promptBuilder");
const groqService = require("./groq.service");
const playerContextRepository = require("./playerContext.repository");
const { AIPromptHistory } = require("../database/models");
const { ApiError } = require("../utils/apiError");
// const ApiError = require("../utils/apiError");

/**
 * ai.service.js
 * ----------------------------------------------------------------------------
 * Business-logic orchestration for the AI Coach. Ties together:
 *   1. Conversation persistence (conversation.repository)
 *   2. Player performance/context data (playerContext.repository)
 *   3. Structured prompt construction (promptBuilder)
 *   4. The actual Gemini call (gemini.service)
 *
 * Controllers should only ever call into this service — never into the
 * repository or Gemini service directly.
 */

const MAX_HISTORY_MESSAGES = 20; // rolling window sent to Gemini for context

/**
 * Handle a single chat turn: enrich, call Gemini, persist, return.
 *
 * @param {number} userId - authenticated player's id (from JWT)
 * @param {string} message - the player's raw question
 * @param {number|null} conversationId - existing thread, or null to start a new one
 * @returns {Promise<{conversation: object, userMessage: object, assistantMessage: object}>}
 */
async function sendChatMessage(userId, message, conversationId = null) {
  if (!message || !message.trim()) {
    throw new ApiError(400, "Message content is required.");
  }

  // 1. Resolve or create the conversation thread.
  let conversation;
  if (conversationId) {
    conversation = await conversationRepository.findConversationById(
      conversationId,
      userId,
    );
    if (!conversation) {
      throw new ApiError(404, "Conversation not found.");
    }
  } else {
    conversation = await conversationRepository.createConversation(userId, {
      firstMessageContent: message,
    });
  }

  // 2. Pull recent chat history for continuity (empty array for new threads).
  const recentMessages = await conversationRepository.getRecentMessages(
    conversation.id,
    MAX_HISTORY_MESSAGES,
  );

  // 3. Gather whatever player context is available. Any missing sections are
  // simply absent from the returned object — promptBuilder is responsible
  // for omitting them gracefully rather than inventing values.
  const playerContext = await playerContextRepository.getPlayerContext(userId);

  // 4. Build the structured, context-enriched prompt — never send the raw
  // user message straight to Gemini.
  const structuredPrompt = promptBuilder.buildChatPrompt({
    playerContext,
    conversationHistory: recentMessages,
    question: message,
  });

  // 5. Call Gemini.
  let aiResult;
 try {
   aiResult = await groqService.generateResponse(structuredPrompt);
 } catch (err) {
   console.error("GROQ Error:");
   console.error(err);
   console.error(err.stack);

   await AIPromptHistory.create({
     userId,
     prompt: structuredPrompt,
     response: null,
   }).catch(() => {});

   throw err; // <-- temporarily rethrow the original error
 }

  // 6. Persist the user question + assistant reply atomically.
  const { userMessage, assistantMessage } =
    await conversationRepository.addMessagePair(conversation.id, {
      userContent: message,
      assistantContent: aiResult.text,
      assistantTokens: aiResult.tokensUsed ?? null,
    });

  // 7. Fire-and-forget audit log of the full enriched prompt + raw response.
  AIPromptHistory.create({
    userId,
    prompt: structuredPrompt,
    response: aiResult.text,
  }).catch((err) => {
    // Prompt history is an analytics/debug aid, not critical path — log and move on.
    console.error("Failed to write AIPromptHistory:", err);
  });

  return { conversation, userMessage, assistantMessage };
}

/**
 * List all conversations for the sidebar.
 */
async function getConversations(userId) {
  return conversationRepository.listConversationsForUser(userId);
}

/**
 * Fetch a single conversation with its full transcript.
 */
async function getConversationById(userId, conversationId) {
  const conversation =
    await conversationRepository.findConversationWithMessages(
      conversationId,
      userId,
    );

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  return conversation;
}

/**
 * Delete a conversation the user owns.
 */
async function deleteConversation(userId, conversationId) {
  const deleted = await conversationRepository.deleteConversation(
    conversationId,
    userId,
  );
  if (!deleted) {
    throw new ApiError(404, "Conversation not found.");
  }
  return true;
}

/**
 * Generate a short list of suggested follow-up questions, personalized where
 * possible (e.g. referencing the player's upcoming opponent or a known
 * weakness) but falling back to strong generic prompts if context is thin.
 */
async function getSuggestedPrompts(userId) {
  const playerContext = await playerContextRepository.getPlayerContext(userId);
  return promptBuilder.buildSuggestedPrompts(playerContext);
}

module.exports = {
  sendChatMessage,
  getConversations,
  getConversationById,
  deleteConversation,
  getSuggestedPrompts,
};
