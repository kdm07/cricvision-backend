module.exports = (sequelize, DataTypes) => {
  const SquadPlayer = sequelize.define("SquadPlayer", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: DataTypes.STRING, // "Playing XI", "Reserve", "Captain"
  });

  SquadPlayer.associate = (models) => {
    SquadPlayer.belongsTo(models.Squad, { foreignKey: "squadId" });
    SquadPlayer.belongsTo(models.Player, { foreignKey: "playerId" });
  };

  return SquadPlayer;
};
