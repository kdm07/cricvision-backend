module.exports = (sequelize, DataTypes) => {
  const PlayerTag = sequelize.define("PlayerTag", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    notes: DataTypes.TEXT,
  });

  PlayerTag.associate = (models) => {
    PlayerTag.belongsTo(models.Player, { foreignKey: "playerId" });
    PlayerTag.belongsTo(models.Tag, { foreignKey: "tagId" });
    PlayerTag.belongsTo(models.VideoClip, { foreignKey: "videoClipId" });
    PlayerTag.belongsTo(models.User, {
      foreignKey: "enteredById",
      as: "enteredBy",
    });
  };

  return PlayerTag;
};
