const config = require('../app/config.json');

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('FarmUnits', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      health: {
        type: Sequelize.FLOAT,
        defaultValue:
          Math.floor(Math.random() * (config.maxHealth - config.minHealth + 1) + config.minHealth),
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
        type: Sequelize.BOOLEAN,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      previousLostHealth: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      lastTimeFed: {
        type: Sequelize.DATE,
      },
      FarmUnityTypeId: {
        type: Sequelize.UUID,
        references: {
          model: 'FarmUnityTypes',
          key: 'id',
        },
      },
      FarmBuildingId: {
        type: Sequelize.UUID,
        references: {
          model: 'FarmBuildings',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    queryInterface.dropTable('FarmUnits');
  },
};
