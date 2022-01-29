const express = require('express');
const db = require('./models/db');
const controllerFarmUnit = require('./controllers/farm-unit');
const controllerFarmBuilding = require('./controllers/farm-building');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/farm/buildings', require('./routes/farm-building'));
app.use('/farm/units', require('./routes/farm-unit'));
app.use('/farm/unity-types', require('./routes/farm-unity-type'));

const COUNTDOWN_MILLISECONDS = 1000;

db.sequelize
  .sync({
    // force: true
    alter: true,
  })
  .then(() => {
    const PORT = process.env.EXTERNAL_PORT;
    app.listen(PORT, () => {
      console.log(`running on server port ${PORT}`);
      const intervalFunc = () => {
        controllerFarmBuilding.countDown();
        controllerFarmUnit.countDown();
      };
      setInterval(intervalFunc, COUNTDOWN_MILLISECONDS);
    });
  })
  .catch((error) => console.log(error));
