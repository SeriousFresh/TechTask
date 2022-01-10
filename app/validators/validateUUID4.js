const validate = require('uuid-validate');

module.exports = () => (req, res, next) => {
  const { id } = req.params;
  if (validate(id, 4)) return next();
  return res.status(400).json({ message: 'ID not valid. Should be UUID4 format!' });
};
