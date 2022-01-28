const router = require('express').Router();
const controller = require('../controllers/farm-unit');
const validateParams = require('../validators/validateUUID4Params');
const validateBody = require('../validators/validateUUID4BodyParams');

router
  .get('/', controller.getAll)
  .get('/:id', validateParams('id'), controller.getOne)
  .post('/', validateBody('farmUnityTypeId'), controller.createOne)
  .put('/:id', validateParams('id'), validateBody('farmUnityTypeId'), controller.updateOne)
  .delete('/:id', validateParams('id'), controller.deleteOne)
  .put('/feed/:id', validateParams('id'), controller.feed);

module.exports = router;
