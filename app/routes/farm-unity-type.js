const router = require('express').Router();
const controller = require('../controllers/farm-unity-type');
const validateParams = require('../validators/validateUUID4Params');

router
  .get('/', controller.getAll)
  .get('/:id', validateParams('id'), controller.getOne)
  .post('/', controller.createOne)
  .put('/:id', validateParams('id'), controller.updateOne)
  .delete('/:id', validateParams('id'), controller.deleteOne);

module.exports = router;
