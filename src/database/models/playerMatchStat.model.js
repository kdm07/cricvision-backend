module.exports = (sequelize, DataTypes) => {
  const PlayerMatchStat = sequelize.define("PlayerMatchStat", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    runs: { type: DataTypes.INTEGER, defaultValue: 0 },
    ballsFaced: { type: DataTypes.INTEGER, defaultValue: 0 },
    wickets: { type: DataTypes.INTEGER, defaultValue: 0 },
    oversBowled: { type: DataTypes.DECIMAL(5, 1), defaultValue: 0 },
    runsConceded: { type: DataTypes.INTEGER, defaultValue: 0 },
    catches: { type: DataTypes.INTEGER, defaultValue: 0 },
    // e.g. "not out", "lbw", "caught", "bowled", "run out" — shown in the
    // scouting profile's Match-by-Match table.
    dismissalType: { type: DataTypes.STRING, allowNull: true },
    strikeRate: {
      type: DataTypes.VIRTUAL,
      get() {
        const balls = this.getDataValue("ballsFaced");
        return balls > 0
          ? Number(((this.getDataValue("runs") / balls) * 100).toFixed(2))
          : 0;
      },
    },
    economyRate: {
      type: DataTypes.VIRTUAL,
      get() {
        const overs = this.getDataValue("oversBowled");
        return overs > 0
          ? Number((this.getDataValue("runsConceded") / overs).toFixed(2))
          : 0;
      },
    },
  });

  PlayerMatchStat.associate = (models) => {
    PlayerMatchStat.belongsTo(models.Player, { foreignKey: "playerId" });
    PlayerMatchStat.belongsTo(models.Match, { foreignKey: "matchId" });
    PlayerMatchStat.belongsTo(models.User, {
      foreignKey: "enteredById",
      as: "enteredBy",
    });
  };

  return PlayerMatchStat;
};
