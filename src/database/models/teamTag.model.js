module.exports = (sequelize, DataTypes) => {
  const TeamTag = sequelize.define("TeamTag", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    notes: DataTypes.TEXT,
  });

  TeamTag.associate = (models) => {
    TeamTag.belongsTo(models.Team, { foreignKey: "teamId" });
    TeamTag.belongsTo(models.Tag, { foreignKey: "tagId" });
    TeamTag.belongsTo(models.User, {
      foreignKey: "enteredById",
      as: "enteredBy",
    });
  };

  return TeamTag;
};
