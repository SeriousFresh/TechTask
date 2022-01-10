/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
  process.env.PGDATABASE || 'tech_task_db',
  process.env.PGUSER || 'wukass',
  process.env.PGPASSWORD || '12345',
  {
    host: process.env.PGHOST || 'tech_task_node_db',
    dialect: 'postgres',
  },
);

fs.readdirSync(__dirname)
  .filter((file) => (
    file.indexOf('.') !== 0
    && file !== basename
    && file.slice(-3) === '.js'
  ))
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require
    // eslint-disable-next-line global-require
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;