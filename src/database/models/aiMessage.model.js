module.exports = (sequelize, DataTypes) => {
  const AIMessage = sequelize.define(
    "AIMessage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "conversation_id",
      },
      role: {
        type: DataTypes.ENUM("user", "assistant", "system"),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      tokens: {
        // Approximate token count for this message — used for context-window
        // budgeting when we trim history before sending it to Gemini.
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "ai_messages",
      underscored: true,
      // Only createdAt is meaningful for a chat message; it is never edited.
      timestamps: true,
      updatedAt: false,
    },
  );

  AIMessage.associate = (models) => {
    AIMessage.belongsTo(models.AIConversation, {
      foreignKey: "conversationId",
      as: "conversation",
    });
  };

  return AIMessage;
};
