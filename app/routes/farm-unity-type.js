const router = require('express').Router();
const controller = require('../controllers/farm-unity-type');
const validator = require('../validators/validateUUID4');

router
  .get('/', controller.getAll)
  .get('/:id', validator(), controller.getOne)
  .post('/', controller.createOne)
  .put('/:id', validator(), controller.updateOne)
  .delete('/:id', validator(), controller.deleteOne);

module.exports = router;
