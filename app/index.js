const express = require('express');

const sequelize = require('./util/database');
// const User = require('./models/user');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/dev', require('./routes/dev'));
app.use('/users', require('./routes/users'));

(async () => {
  try {
    await sequelize.sync({
      force: false,
    });
    console.log('test');
  } catch (error) {
    console.log(error);
  }
})();

try {
  app.listen(process.env.EXTERNAL_PORT || 3001, () => {
    console.log(`running on server port ${process.env.PORT || 3001}`);
  });
} catch (error) {
  console.error(error);
}
