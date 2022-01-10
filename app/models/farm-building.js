module.exports = (sequelize, Datatypes) => {
  const FarmBuilding = sequelize.define('FarmBuilding', {
    id: {
      type: Datatypes.UUID,
      defaultValue: Datatypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Datatypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    health: {
      type: Datatypes.INTEGER,
      defaultValue: Math.floor(Math.random() * (100 - 50 + 1) + 50),
      // not sure if defaultValue like this will work in production
      allowNull: false,
    },
    isDead: {
      type: Datatypes.BOOLEAN,
      defaultValue: false,
      get() {
        const health = this.getDataValue('health');
        return health <= 0;
      },
    },
  });

  FarmBuilding.associate = (models) => {
    models.FarmBuilding.hasMany(models.FarmUnit, { as: 'farmUnits' });
    models.FarmBuilding.belongsTo(models.FarmUnityType, { foreignKey: { allowNull: false } });
  };

  return FarmBuilding;
};
