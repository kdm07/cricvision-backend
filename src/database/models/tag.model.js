module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define("Tag", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    label: { type: DataTypes.STRING, allowNull: false, unique: true },
    category: {
      type: DataTypes.ENUM("strength", "weakness"),
      allowNull: false,
    },
  });

  Tag.associate = (models) => {
    Tag.hasMany(models.PlayerTag, { foreignKey: "tagId" });
    Tag.hasMany(models.TeamTag, { foreignKey: "tagId" });
  };

  return Tag;
};
