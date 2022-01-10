module.exports = (sequelize, Datatypes) => {
  const FarmUnityType = sequelize.define('FarmUnityType', {
    id: {
      type: Datatypes.UUID,
      defaultValue: Datatypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Datatypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  });

  FarmUnityType.associate = (models) => {
    models.FarmUnityType.hasMany(models.FarmUnit, { foreignKey: { allowNull: false }, as: 'farmUnits' });
    models.FarmUnityType.hasMany(models.FarmBuilding, { as: 'farmBuildings' });
  };

  return FarmUnityType;
};
