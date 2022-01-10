const { Op } = require('sequelize');
const moment = require('moment');
const db = require('../models/db');
const config = require('../../config.json');

const {
  FarmBuilding,
  FarmUnit,
  FarmUnityType,
} = db;

exports.getAll = async (req, res) => {
  try {
    const farmUnits = await FarmUnit.findAll({
      include: [
        { model: FarmBuilding },
        { model: FarmUnityType },
      ],
    });
    return res.status(200).json(farmUnits);
  } catch (error) {
    return res.status(500).json({ message: 'Error while getting all farm units!', error });
  }
};

exports.getOne = (req, res) => {
  FarmUnit.findOne({
    where: { id: req.params.id },
    include: [{ model: FarmUnityType }, { model: FarmBuilding }],
  })
    .then((farmUnit) => {
      if (farmUnit) return res.status(200).json(farmUnit);
      return res.status(404).json({ message: 'Farm unit for this ID does not exist!' });
    })
    .catch((error) => res.status(500).json({ message: 'Error while getting farm unit!', error }));
};

exports.createOne = async (req, res) => {
  const { farmUnitName, farmUnityTypeId } = req.body;
  try {
    const farmUnityType = await FarmUnityType.findByPk(farmUnityTypeId);
    if (!farmUnityType) return res.status(404).json({ message: 'Farm unity type with this id does not exist!' });
    const newFarmUnitData = {
      name: farmUnitName,
      FarmUnityTypeId: farmUnityTypeId,
    };
    const farmUnit = await FarmUnit.create(newFarmUnitData);
    return res.status(201).json(farmUnit);
  } catch (error) {
    return res.status(500).json({ message: 'Error while creating farm unit!', error });
  }
};

exports.updateOne = async (req, res) => {
  try {
    const { farmUnitName, farmUnityTypeId } = req.body;
    const newFarmUnitData = { name: farmUnitName, FarmUnityTypeId: farmUnityTypeId };
    const farmUnit = await FarmUnit.findByPk(req.params.id);
    if (!farmUnit) return res.status(404).json({ message: 'Farm unit with this id does not exist!' });
    const farmUnityType = await FarmUnityType.findByPk(farmUnityTypeId);
    if (!farmUnityType) return res.status(404).json({ message: 'Farm unity type with this id does not exist!' });
    await farmUnit.update(newFarmUnitData);
    return res.status(200).json(farmUnit);
  } catch (error) {
    return res.status(500).json({ message: 'Error while updating farm unit!', error });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const farmUnit = await FarmUnit.findByPk(req.params.id);
    if (!farmUnit) return res.status(404).json({ message: 'Farm unit with this id does not exist!' });
    await farmUnit.destroy();
    return res.status(200).json({ message: 'Farm unit successfully deleted!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error while deleting farm unit!', error });
  }
};

exports.feed = async (req, res) => {
  try {
    const dateNow = new Date();
    const momentNow = moment(dateNow);
    const farmUnit = await FarmUnit.findByPk(req.params.id);
    if (!farmUnit) return res.status(404).json({ message: 'Farm unit for this id does not exist!' });
    const timeDifference = momentNow.diff(moment(farmUnit.lastTimeFed), 'seconds');
    if (farmUnit.lastTimeFed == null || timeDifference >= config.feedLimitSeconds) {
      const healthToAdd = farmUnit.previousLostHealth !== 0
        ? (1 + farmUnit.previousLostHealth / 2) : 1;
      const newHealth = farmUnit.health + healthToAdd > config.maxHealth
        ? config.maxHealth : farmUnit.health + healthToAdd;
      await farmUnit.update({
        health: newHealth,
        isDead: false,
        feedingCountdown: config.countdownUnit,
        lastTimeFed: dateNow,
      });
      return res.status(200).json({
        message: 'Farm unit successfully fed!',
      });
    }
    return res.status(403).json({ message: 'Farm units can not be fed more than once every 5 seconds!' });
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.countDown = async () => {
  try {
    const farmUnits = await FarmUnit.findAll({
      where: {
        FarmBuildingId: { [Op.not]: null },
        isDead: false,
      },
    });
    const promises = [];
    for (const farmUnit of farmUnits) {
      promises.push(farmUnit.update({ feedingCountdown: farmUnit.feedingCountdown - 1 }));
    }
    return Promise.all(promises);
  } catch (error) {
    return Promise.resolve();
  }
};
