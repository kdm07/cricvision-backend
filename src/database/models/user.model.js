module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "analyst", "coach", "player"),
      allowNull: false,
    },
  });

  User.associate = (models) => {
    // One login account maps to at most one cricket Player profile.
    User.hasOne(models.Player, { foreignKey: "userId", as: "playerProfile" });

    User.hasMany(models.PlayerMatchStat, {
      foreignKey: "enteredById",
      as: "statsEntered",
    });
    User.hasMany(models.PlayerTag, {
      foreignKey: "enteredById",
      as: "playerTagsEntered",
    });
    User.hasMany(models.TeamTag, {
      foreignKey: "enteredById",
      as: "teamTagsEntered",
    });
    User.hasMany(models.AttitudeRating, {
      foreignKey: "ratedById",
      as: "ratingsGiven",
    });
    User.hasMany(models.VideoClip, {
      foreignKey: "uploadedById",
      as: "videosUploaded",
    });
    User.hasMany(models.ScoutingReport, {
      foreignKey: "generatedById",
      as: "reportsGenerated",
    });
    User.hasMany(models.Squad, {
      foreignKey: "createdById",
      as: "squadsCreated",
    });
  };

  return User;
};
