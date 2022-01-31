const sequelize = require('sequelize');
const moment = require('moment');
const db = require('../models/db');
const config = require('../config.json');

const { Op } = sequelize;
const {
  FarmBuilding,
  FarmUnit,
  FarmUnityType,
} = db;

const { STANDARD_FEEDING_ADDITION, PERCENTAGE_OF_LOST_HEALTH_TO_ADD } = config;

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
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const dateNow = new Date();
    const momentNow = moment(dateNow);
    const farmUnit = await FarmUnit.findOne({
      where: { id },
      lock: true,
      transaction,
    });
    if (!farmUnit) return res.status(404).json({ message: 'Farm unit for this id does not exist!' });
    const timeDifference = momentNow.diff(moment(farmUnit.lastTimeFed), 'seconds');
    if (farmUnit.lastTimeFed == null || timeDifference >= config.feedLimitSeconds) {
      let healthToAdd = STANDARD_FEEDING_ADDITION;
      if (farmUnit.previousLostHealth !== 0) {
        healthToAdd += farmUnit.previousLostHealth * PERCENTAGE_OF_LOST_HEALTH_TO_ADD;
      }
      const newHealth = farmUnit.health + healthToAdd > config.maxHealth
        ? config.maxHealth : farmUnit.health + healthToAdd;
      await farmUnit.update({
        health: newHealth,
        isDead: false,
        feedingCountdown: config.countdownUnit,
        lastTimeFed: dateNow,
      }, { transaction });
      await transaction.commit();
      return res.status(200).json({
        message: 'Farm unit successfully fed!',
      });
    }
    await transaction.commit();
    return res.status(403).json({ message: 'Farm units can not be fed more than once every 5 seconds!' });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res.status(500).json(error);
  }
};

exports.countDown = async () => {
  try {
    const result = await db.sequelize.transaction(async (transaction) => {
      const farmUnits = await FarmUnit.findAll({
        where: {
          FarmBuildingId: { [Op.not]: null },
          isDead: false,
        },
        transaction,
        lock: true,
      });
      const promises = [];
      for (const farmUnit of farmUnits) {
        promises.push(farmUnit.update(
          { feedingCountdown: farmUnit.feedingCountdown - 1 },
          { transaction },
        ));
      }
      return Promise.all(promises);
    });
    return result;
  } catch (error) {
    return Promise.reject();
  }
};
