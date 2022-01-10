const db = require('../models/db');

const {
  FarmUnityType,
} = db;

exports.getAll = async (req, res) => {
  FarmUnityType.findAll()
    .then((farmUnityTypes) => res.status(200).json(farmUnityTypes))
    .catch((error) => res.status(500).json({
      message: 'Error while getting all farm unity types!', error,
    }));
};

exports.getOne = (req, res) => {
  FarmUnityType.findOne({ where: { id: req.params.id } })
    .then((farmUnityType) => {
      if (farmUnityType) return res.status(200).json(farmUnityType);
      return res.status(404).json({ message: 'Farm unity type by this id not found!' });
    })
    .catch((error) => res.status(500).json({ message: 'Error while getting farm unity type!', error }));
};

exports.createOne = (req, res) => {
  FarmUnityType.create({ name: req.body.name })
    .then((farmUnityType) => res.status(201).json(farmUnityType))
    .catch((error) => res.status(500).json({ message: 'Error while creating farm unity type!', error }));
};

exports.updateOne = async (req, res) => {
  const { name } = req.body;
  const farmUnityType = await FarmUnityType.findOne({ where: { id: req.params.id } });
  try {
    if (!farmUnityType) return res.status(404).json({ message: 'Farm unity type by this id not found!' });
    await farmUnityType.update({ name });
    return res.status(200).json({ message: 'Farm unity type successfully updated!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error while updating farm unity type!', error });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const farmUnityType = await FarmUnityType.findByPk(req.params.id);
    if (!farmUnityType) return res.status(404).json({ message: 'Farm unity type for this ID does not exist!' });
    await farmUnityType.destroy();
    return res.status(200).json({ message: 'Farm unity type successfully deleted!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error while deleting farm unity type!', error });
  }
};
