module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define("Team", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    region: DataTypes.STRING,
    logoUrl: DataTypes.STRING,
  });

  Team.associate = (models) => {
    Team.belongsToMany(models.Player, {
      through: models.TeamRoster,
      foreignKey: "teamId",
    });
    Team.hasMany(models.TeamRoster, { foreignKey: "teamId" });
    Team.hasMany(models.Match, { foreignKey: "teamAId", as: "homeMatches" });
    Team.hasMany(models.Match, { foreignKey: "teamBId", as: "awayMatches" });
    Team.hasMany(models.TeamTag, { foreignKey: "teamId" });
    Team.hasMany(models.ScoutingReport, { foreignKey: "opponentTeamId" });
    Team.hasMany(models.Squad, { foreignKey: "teamId" });
  };

  return Team;
};
