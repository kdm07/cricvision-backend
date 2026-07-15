module.exports = (sequelize, DataTypes) => {
  const AIPromptHistory = sequelize.define(
    "AIPromptHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
     userId: {
  type: DataTypes.UUID,
  allowNull: false,
  field: "user_id",
},
      prompt: {
        // The full, context-enriched prompt actually sent to Gemini —
        // not just the player's raw question.
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      response: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
    },
    {
      tableName: "ai_prompt_history",
      underscored: true,
      timestamps: true,
      updatedAt: false,
    },
  );

  AIPromptHistory.associate = (models) => {
    AIPromptHistory.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return AIPromptHistory;
};
