module.exports = (sequelize, DataTypes) => {
  const AIConversation = sequelize.define(
    "AIConversation",
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "New Conversation",
      },
    },
    {
      tableName: "ai_conversations",
      underscored: true,
      timestamps: true,
    },
  );

  AIConversation.associate = (models) => {
    // A conversation belongs to a single authenticated user (player).
    AIConversation.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    // A conversation contains many messages, oldest first.
    AIConversation.hasMany(models.AIMessage, {
      foreignKey: "conversationId",
      as: "messages",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return AIConversation;
};
