module.exports = (sequelize, DataTypes) => {
  const AttitudeRating = sequelize.define("AttitudeRating", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    confidence: DataTypes.INTEGER,
    aggression: DataTypes.INTEGER,
    discipline: DataTypes.INTEGER,
    leadership: DataTypes.INTEGER,
    teamwork: DataTypes.INTEGER,
    pressureHandling: DataTypes.INTEGER,
  });

  AttitudeRating.associate = (models) => {
    AttitudeRating.belongsTo(models.Player, { foreignKey: "playerId" });
    AttitudeRating.belongsTo(models.User, {
      foreignKey: "ratedById",
      as: "ratedBy",
    });
  };

  return AttitudeRating;
};
