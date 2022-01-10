const router = require('express').Router();
const controller = require('../controllers/farm-unit');
const validator1 = require('../validators/validateUUID4');
const validator2 = require('../validators/validateUUID4BodyParams');

router
  .get('/', controller.getAll)
  .get('/:id', validator1(), controller.getOne)
  .post('/', validator2(['farmUnityTypeId']), controller.createOne)
  .put('/:id', validator1(), validator2(['farmUnityTypeId']), controller.updateOne)
  .delete('/:id', validator1(), controller.deleteOne)
  .put('/feed/:id', validator1(), controller.feed);

module.exports = router;
