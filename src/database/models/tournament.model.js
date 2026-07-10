module.exports = (sequelize, DataTypes) => {
  const Tournament = sequelize.define("Tournament", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    format: DataTypes.ENUM("T20", "ODI", "Test"),
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
  });

  Tournament.associate = (models) => {
    Tournament.hasMany(models.TeamRoster, { foreignKey: "tournamentId" });
    Tournament.hasMany(models.Match, { foreignKey: "tournamentId" });
    Tournament.hasMany(models.Squad, { foreignKey: "tournamentId" });
  };

  return Tournament;
};
