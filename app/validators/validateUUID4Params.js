const validate = require('uuid-validate');

module.exports = (...paramNames) => (req, res, next) => {
  for (const paramName of paramNames) {
    const id = req.params[paramName];
    if (!validate(id, 4)) return res.status(400).json({ message: `ID(${paramName}) not valid. Should be UUID4 format!` });
  }
  return next();
};
