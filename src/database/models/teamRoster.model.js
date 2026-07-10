module.exports = (sequelize, DataTypes) => {
  const TeamRoster = sequelize.define("TeamRoster", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seasonLabel: DataTypes.STRING, // e.g. "IPL 2026"
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY, // null = currently active membership
  });

  TeamRoster.associate = (models) => {
    TeamRoster.belongsTo(models.Player, { foreignKey: "playerId" });
    TeamRoster.belongsTo(models.Team, { foreignKey: "teamId" });
    TeamRoster.belongsTo(models.Tournament, { foreignKey: "tournamentId" });
  };

  return TeamRoster;
};
