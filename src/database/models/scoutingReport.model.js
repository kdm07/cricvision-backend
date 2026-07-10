module.exports = (sequelize, DataTypes) => {
  const ScoutingReport = sequelize.define("ScoutingReport", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    summary: DataTypes.TEXT,
    strategyNotes: DataTypes.TEXT,
  });

  ScoutingReport.associate = (models) => {
    ScoutingReport.belongsTo(models.Team, {
      foreignKey: "opponentTeamId",
      as: "opponentTeam",
    });
    ScoutingReport.belongsTo(models.User, {
      foreignKey: "generatedById",
      as: "generatedBy",
    });
  };

  return ScoutingReport;
};
