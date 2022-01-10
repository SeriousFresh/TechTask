const validate = require('uuid-validate');

module.exports = (paramNames) => (req, res, next) => {
  if (paramNames && paramNames instanceof Array) {
    for (const paramName of paramNames) {
      const id = req.body[paramName];
      if (!validate(id, 4)) return res.status(400).json({ message: 'ID not valid. Should be UUID4 format!' });
    }
  }
  return next();
};
