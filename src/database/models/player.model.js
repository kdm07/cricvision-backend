module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define("Player", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("Batter", "Bowler", "AllRounder", "WicketKeeper"),
      allowNull: false,
    },
    battingStyle: DataTypes.STRING,
    bowlingStyle: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    profilePhotoUrl: DataTypes.STRING,
  });

  Player.associate = (models) => {
    Player.belongsToMany(models.Team, {
      through: models.TeamRoster,
      foreignKey: "playerId",
    });
    Player.hasMany(models.TeamRoster, { foreignKey: "playerId" });
    Player.belongsToMany(models.Squad, {
      through: models.SquadPlayer,
      foreignKey: "playerId",
    });
    Player.hasMany(models.PlayerMatchStat, { foreignKey: "playerId" });
    Player.hasMany(models.PlayerTag, { foreignKey: "playerId" });
    Player.hasMany(models.AttitudeRating, { foreignKey: "playerId" });
    Player.hasMany(models.VideoClip, { foreignKey: "playerId" });
  };

  return Player;
};
