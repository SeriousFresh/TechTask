const express = require('express');
const db = require('./models/db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/farm/buildings', require('./routes/farm-building'));
app.use('/farm/units', require('./routes/farm-unit'));
app.use('/farm/unity-types', require('./routes/farm-unity-type'));

db.sequelize
  .sync({
    // force: true
    alter: true,
  })
  .then(() => {
    const port = process.env.EXTERNAL_PORT || 3001;
    app.listen(port, () => {
      console.log(`running on server port ${port}`);
    });
  })
  .catch((error) => console.log(error));
