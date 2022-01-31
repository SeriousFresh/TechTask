const config = require('../app/config.json');

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('FarmBuildings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      feedingCountdown: {
        type: Sequelize.INTEGER,
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
      FarmUnityTypeId: {
        type: Sequelize.UUID,
        references: {
          model: 'FarmUnityTypes',
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
    queryInterface.dropTable('FarmBuildings');
  },
};
