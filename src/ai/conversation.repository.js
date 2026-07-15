"use strict";

const { AIConversation, AIMessage, sequelize } = require("../database/models");

/**
 * conversation.repository.js
 * ----------------------------------------------------------------------------
 * Data-access layer for AI Coach conversations/messages. This is the ONLY
 * module in the codebase that should issue Sequelize queries against
 * AIConversation / AIMessage — services call into this repository rather than
 * touching the models directly. Keeps persistence concerns isolated from
 * business logic (prompt building, Gemini calls, etc.).
 */

const DEFAULT_TITLE = "New Conversation";
const MAX_TITLE_LENGTH = 60;

/**
 * Derive a short, human-readable conversation title from the player's first
 * message, e.g. "How should I prepare for the leg spinner tomorrow?" ->
 * "How should I prepare for the leg spinner..."
 */
function deriveTitleFromMessage(content) {
  if (!content || typeof content !== "string") return DEFAULT_TITLE;
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (!trimmed) return DEFAULT_TITLE;
  return trimmed.length > MAX_TITLE_LENGTH
    ? `${trimmed.slice(0, MAX_TITLE_LENGTH).trim()}...`
    : trimmed;
}

/**
 * Create a brand-new conversation for a user, optionally seeding the title
 * from their opening message.
 */
async function createConversation(userId, { title, firstMessageContent } = {}) {
  const resolvedTitle =
    title || deriveTitleFromMessage(firstMessageContent) || DEFAULT_TITLE;

  const conversation = await AIConversation.create({
    userId,
    title: resolvedTitle,
  });

  return conversation;
}

/**
 * Fetch a single conversation by id, scoped to the owning user so one player
 * can never read another player's chat history.
 */
async function findConversationById(conversationId, userId) {
  return AIConversation.findOne({
    where: { id: conversationId, userId },
  });
}

/**
 * List all conversations for a user, most recently updated first, with a
 * lightweight message count for the sidebar (no full transcript loaded).
 */
async function listConversationsForUser(userId) {
  const conversations = await AIConversation.findAll({
    where: { userId },
    order: [["updatedAt", "DESC"]],
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM ai_messages WHERE ai_messages.conversation_id = AIConversation.id)",
          ),
          "messageCount",
        ],
      ],
    },
  });

  return conversations;
}

/**
 * Fetch a conversation together with its full, chronologically ordered
 * message transcript. Used both for rendering the chat UI and for building
 * the "previous conversations" context fed into Gemini.
 */
async function findConversationWithMessages(conversationId, userId) {
  return AIConversation.findOne({
    where: { id: conversationId, userId },
    include: [
      {
        model: AIMessage,
        as: "messages",
        separate: true, // ensures correct ORDER BY when combined with a hasMany include
        order: [["createdAt", "ASC"]],
      },
    ],
  });
}

/**
 * Append a single message to a conversation and bump the conversation's
 * updatedAt (via Sequelize's automatic timestamp on save) so it resurfaces
 * at the top of the sidebar.
 */
async function addMessage(conversationId, { role, content, tokens = null }) {
  const message = await AIMessage.create({
    conversationId,
    role,
    content,
    tokens,
  });

  // Touch the parent conversation so ordering-by-recency in the sidebar
  // reflects the latest activity, not just creation time.
  await AIConversation.update(
    { updatedAt: new Date() },
    { where: { id: conversationId }, silent: false },
  );

  return message;
}

/**
 * Persist the user question and assistant reply in a single transaction so
 * a chat turn is always all-or-nothing (no orphaned user message if the
 * assistant write fails, or vice versa).
 */
async function addMessagePair(
  conversationId,
  { userContent, assistantContent, assistantTokens },
) {
  return sequelize.transaction(async (t) => {
    const userMessage = await AIMessage.create(
      { conversationId, role: "user", content: userContent },
      { transaction: t },
    );

    const assistantMessage = await AIMessage.create(
      {
        conversationId,
        role: "assistant",
        content: assistantContent,
        tokens: assistantTokens ?? null,
      },
      { transaction: t },
    );

    await AIConversation.update(
      { updatedAt: new Date() },
      { where: { id: conversationId }, transaction: t },
    );

    return { userMessage, assistantMessage };
  });
}

/**
 * Get the most recent N messages for a conversation, oldest-first — used to
 * build the rolling chat-history window sent to Gemini without blowing the
 * context budget on very long threads.
 */
async function getRecentMessages(conversationId, limit = 20) {
  const messages = await AIMessage.findAll({
    where: { conversationId },
    order: [["createdAt", "DESC"]],
    limit,
  });

  return messages.reverse(); // chronological order for prompt construction
}

/**
 * Delete a conversation (and cascade its messages, via FK ON DELETE CASCADE),
 * scoped to the owning user.
 */
async function deleteConversation(conversationId, userId) {
  const deletedCount = await AIConversation.destroy({
    where: { id: conversationId, userId },
  });

  return deletedCount > 0;
}

module.exports = {
  createConversation,
  findConversationById,
  listConversationsForUser,
  findConversationWithMessages,
  addMessage,
  addMessagePair,
  getRecentMessages,
  deleteConversation,
  deriveTitleFromMessage,
};
