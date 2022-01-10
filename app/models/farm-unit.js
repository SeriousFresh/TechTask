const config = require('../../config.json');

module.exports = (sequelize, Datatypes) => {
  const FarmUnit = sequelize.define('FarmUnit', {
    id: {
      type: Datatypes.UUID,
      defaultValue: Datatypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Datatypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    health: {
      type: Datatypes.FLOAT,
      defaultValue:
        Math.floor(Math.random() * (config.maxHealth - config.minHealth + 1) + config.minHealth),
      // not sure if defaultValue like this will work in production
      allowNull: false,
      get() {
        return this.getDataValue('health');
      },
      set(newHealth) {
        if (newHealth <= 0) {
          this.setDataValue('isDead', true);
          this.setDataValue('health', 0);
        } else {
          this.setDataValue('health', newHealth);
          this.setDataValue('isDead', false);
        }
      },
    },
    isDead: {
      type: Datatypes.BOOLEAN,
      defaultValue: false,
      get() {
        const health = this.getDataValue('health');
        return health <= 0;
      },
      set(value) {
        this.setDataValue('isDead', value);
      },
    },
    feedingCountdown: {
      type: Datatypes.INTEGER,
      defaultValue: config.countdownUnit,
      allowNull: false,
      get() {
        return this.getDataValue('feedingCountdown');
      },
      set(newCountDown) {
        if (newCountDown === 0) {
          const oldHealth = this.getDataValue('health');
          let newHealth;
          if (oldHealth - 1 <= 0) {
            newHealth = 0;
            this.setDataValue('isDead', true);
          } else newHealth = oldHealth - 1;
          this.setDataValue('health', newHealth);
          this.setDataValue('feedingCountdown', config.countdownUnit);
          const currentLostHealth = this.getDataValue('currentLostHealth');
          this.setDataValue('currentLostHealth', currentLostHealth + 1);
        } else {
          this.setDataValue('feedingCountdown', newCountDown);
        }
      },
    },
    currentLostHealth: {
      type: Datatypes.FLOAT,
      defaultValue: 0,
    },
    previousLostHealth: {
      type: Datatypes.FLOAT,
      defaultValue: 0,
    },
    lastTimeFed: {
      type: Datatypes.DATE,
    },
  });

  FarmUnit.associate = (models) => {
    models.FarmUnit.belongsTo(models.FarmUnityType, { foreignKey: { allowNull: false } });
    models.FarmUnit.belongsTo(models.FarmBuilding, { foreignKey: { allowNull: true } });
  };

  return FarmUnit;
};
