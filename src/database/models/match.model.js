module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define("Match", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    matchDate: DataTypes.DATEONLY,
    venue: DataTypes.STRING,
    result: DataTypes.STRING,
  });

  Match.associate = (models) => {
    Match.belongsTo(models.Team, { foreignKey: "teamAId", as: "teamA" });
    Match.belongsTo(models.Team, { foreignKey: "teamBId", as: "teamB" });
    Match.belongsTo(models.Tournament, { foreignKey: "tournamentId" });
    Match.hasMany(models.PlayerMatchStat, { foreignKey: "matchId" });
    Match.hasMany(models.VideoClip, { foreignKey: "matchId" });
    Match.hasMany(models.Squad, { foreignKey: "matchId" });
  };

  return Match;
};
