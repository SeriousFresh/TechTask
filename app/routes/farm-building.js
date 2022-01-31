const router = require('express').Router();
const controller = require('../controllers/farm-building');
const validateParams = require('../validators/validateUUID4Params');
const validateBody = require('../validators/validateUUID4BodyParams');

router
  .get('/', controller.getAll)
  .get('/:id', validateParams('id'), controller.getOne)
  .post('/', validateBody('farmUnityTypeId'), controller.createOne)
  .put('/:id', validateParams('id'), validateBody('farmUnityTypeId'), controller.updateOne)
  .delete('/:id', validateParams('id'), controller.deleteOne)
  .post('/:farmBuildingId/units/:farmUnitId', validateParams('farmBuildingId', 'farmUnitId'), controller.addFarmUnit)
  .get('/:id/units/', validateParams('id'), controller.getAllFarmUnits);

module.exports = router;
