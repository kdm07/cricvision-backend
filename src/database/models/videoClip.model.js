module.exports = (sequelize, DataTypes) => {
  const VideoClip = sequelize.define("VideoClip", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    storageUrl: { type: DataTypes.STRING, allowNull: false },
    timestampStart: DataTypes.INTEGER,
    timestampEnd: DataTypes.INTEGER,
    tag: DataTypes.STRING,
  });

  VideoClip.associate = (models) => {
    VideoClip.belongsTo(models.Player, { foreignKey: "playerId" });
    VideoClip.belongsTo(models.Match, { foreignKey: "matchId" });
    VideoClip.belongsTo(models.User, {
      foreignKey: "uploadedById",
      as: "uploadedBy",
    });
    VideoClip.hasMany(models.PlayerTag, { foreignKey: "videoClipId" });
  };

  return VideoClip;
};
