module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define("Player", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: true,
    },
    fullName: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("Batter", "Bowler", "AllRounder", "WicketKeeper"),
      allowNull: true,
    },
    battingStyle: DataTypes.STRING,
    bowlingStyle: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    profilePhotoUrl: DataTypes.STRING,
    jerseyNumber: DataTypes.INTEGER,
    region: DataTypes.STRING,

    careerMatches: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    careerRuns: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    careerWickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    careerAverage: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
    },
    careerStrikeRate: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
    },
    // Bowling economy — added for the Players directory ("Econ" column) and
    // scouting profile Career Card, which both display it.
    careerEconomy: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
    },

    extendedProfile: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  });

  Player.associate = (models) => {
    Player.belongsTo(models.User, { foreignKey: "userId", as: "user" });
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
