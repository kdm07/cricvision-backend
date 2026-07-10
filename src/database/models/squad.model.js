module.exports = (sequelize, DataTypes) => {
  const Squad = sequelize.define("Squad", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  });

  Squad.associate = (models) => {
    Squad.belongsToMany(models.Player, {
      through: models.SquadPlayer,
      foreignKey: "squadId",
    });
    Squad.belongsTo(models.Team, { foreignKey: "teamId" });
    Squad.belongsTo(models.Tournament, { foreignKey: "tournamentId" });
    Squad.belongsTo(models.Match, { foreignKey: "matchId" });
    Squad.belongsTo(models.User, {
      foreignKey: "createdById",
      as: "createdBy",
    });
  };

  return Squad;
};
