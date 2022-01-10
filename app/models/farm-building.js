const config = require('../../config.json');

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
    feedingCountdown: {
      type: Datatypes.INTEGER,
      defaultValue: config.countdownBuilding,
      allowNull: false,
      get() {
        return this.getDataValue('feedingCountdown');
      },
      set(newCountDown) {
        if (newCountDown === 0) {
          this.setDataValue('feedingCountdown', config.countdownBuilding);
        } else {
          this.setDataValue('feedingCountdown', newCountDown);
        }
      },
    },
  });

  FarmBuilding.associate = (models) => {
    models.FarmBuilding.hasMany(models.FarmUnit, { as: 'farmUnits' });
    models.FarmBuilding.belongsTo(models.FarmUnityType, { foreignKey: { allowNull: false } });
  };

  return FarmBuilding;
};
