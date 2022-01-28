const { Op } = require('sequelize');
const db = require('../models/db');
const config = require('../../config.json');

const {
  FarmBuilding,
  FarmUnit,
  FarmUnityType,
} = db;

// eslint-disable-next-line no-promise-executor-return
// const sleep = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

const mapFarmBuilding = (farmBuilding) => {
  const obj = {
    id: farmBuilding.id,
    name: farmBuilding.name,
    farmUnityType: farmBuilding.FarmUnityType.name,
    numberOfFarmUnits: farmBuilding.farmUnits.length,
  };
  return obj;
};

exports.getAll = async (req, res) => {
  try {
    const limit = req.query.rowsPerPage || 5;
    const offset = ((req.query.pageNumber || 1) - 1) * limit;
    const orderField = req.query.orderField || 'createdAt';
    const sortType = req.query.sortType || 'asc';
    let farmBuildings = await FarmBuilding.findAll({
      include: [
        { model: FarmUnit, as: 'farmUnits' },
        { model: FarmUnityType },
      ],
      attributes: ['id', 'name', 'FarmUnityTypeId'], // ,[sequelize.fn('COUNT', sequelize.col('FarmUnit.id')), 'numberOfFarmUnits']],
      limit,
      offset,
      order: [[orderField, sortType]],
    });
    farmBuildings = farmBuildings.map((farmBuilding) => mapFarmBuilding(farmBuilding));
    return res.status(200).json(farmBuildings);
  } catch (error) {
    return res.status(500).json({ message: 'Error while getting all farm buildings!', error });
  }
};

exports.getOne = (req, res) => {
  FarmBuilding.findOne({
    where: { id: req.params.id },
    include: [
      { model: FarmUnit, as: 'farmUnits' },
      { model: FarmUnityType },
    ],
    attributes: ['id', 'name', 'FarmUnityTypeId'],
  })
    .then((farmBuilding) => {
      if (farmBuilding) return res.status(200).json(mapFarmBuilding(farmBuilding));
      return res.status(404).json({ message: 'Farm building for this id does not exist!' });
    })
    .catch((error) => res.status(500).json({ message: 'Error while getting farm building!', error }));
};

exports.createOne = async (req, res) => {
  try {
    const { farmBuildingName, farmUnitName, farmUnityTypeId } = req.body;
    const farmUnityType = await FarmUnityType.findByPk(farmUnityTypeId);
    if (!farmUnityType) return res.status(404).json({ message: 'Farm unity type for this ID does not exist!' });
    const newFarmBuildingData = { name: farmBuildingName, FarmUnityTypeId: farmUnityTypeId };
    return FarmBuilding.create(newFarmBuildingData)
      .then((farmBuilding) => {
        const newFarmUnitData = {
          name: farmUnitName,
          FarmUnityTypeId: farmUnityTypeId,
          FarmBuildingId: farmBuilding.id,
        };
        FarmUnit.create(newFarmUnitData)
          .then(() => res.status(201).json(farmBuilding))
          .catch((error) => {
            farmBuilding.destroy();
            return res.status(500).json({ message: 'Error while creating farm building!', error });
          });
      })
      .catch((error) => res.status(500).json({ message: 'Error while creating farm building!', error }));
  } catch (error) {
    return res.status(500).json({ message: 'Error while creating farm building!', error });
  }
};

exports.updateOne = async (req, res) => {
  try {
    const { farmBuildingName, farmUnityTypeId } = req.body;
    const farmBuilding = await FarmBuilding.findByPk(req.params.id);
    if (!farmBuilding) return res.status(404).json({ message: 'Farm building for this ID does not exist!' });
    const farmUnityType = await FarmUnityType.findByPk(farmUnityTypeId);
    if (!farmUnityType) return res.status(404).json({ message: 'Farm unity type for this ID does not exist!' });
    const newFarmBuildingData = { name: farmBuildingName, FarmUnityTypeId: farmUnityTypeId };
    await farmBuilding.update(newFarmBuildingData);
    return res.status(200).json(farmBuilding);
  } catch (error) {
    return res.status(500).json({ message: 'Error while updating farm building!', error });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const farmBuildingId = req.params.id;
    const farmBuilding = await FarmBuilding.findByPk(farmBuildingId);
    if (!farmBuilding) return res.status(404).json({ message: 'Farm building for this ID does not exist!' });
    const promises = [];
    promises.push(FarmUnit.destroy({ where: { FarmBuildingId: farmBuildingId } }));
    promises.push(FarmBuilding.destroy({ where: { id: farmBuildingId } }));
    await Promise.all(promises);
    return res.status(200).json({ message: "Building and it's units successfully deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Error while deleting farm building and it's units!", error });
  }
};

exports.addFarmUnit = async (req, res) => {
  try {
    const { farmBuildingId, farmUnitId } = req.params;
    const farmBuilding = await FarmBuilding.findByPk(farmBuildingId);
    if (!farmBuilding) return res.status(404).json({ message: 'Farm building by this ID does not exist!' });
    const farmUnit = await FarmUnit.findByPk(farmUnitId);
    if (!farmUnit) return res.status(404).json({ message: 'Farm unit by this ID does not exist!' });
    if (farmBuilding.FarmUnityTypeId !== farmUnit.FarmUnityTypeId) return res.status(403).json({ message: 'Farm building and farm unit are not from same unity type!' });
    await farmUnit.update({
      FarmBuildingId: farmBuildingId,
      feedingCountdown: config.countdownUnit,
      currentLostHealth: 0,
      previousLostHealth: 0,
    });
    return res.status(200).json({ message: 'Farm unit successfully added to the farm building!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error while adding farm unit to farm building!', error });
  }
};

exports.getAllFarmUnits = async (req, res) => {
  try {
    const farmBuildingId = req.params.id;
    const limit = req.query.rowsPerPage || 3;
    const offset = ((req.query.pageNumber || 1) - 1) * limit;
    const orderField = req.query.orderField || 'createdAt';
    const sortType = req.query.sortType || 'asc';
    const farmBuilding = await FarmBuilding.findByPk(farmBuildingId);
    if (!farmBuilding) return res.status(404).json({ message: 'Farm building for this ID does not exist!' });
    const farmUnits = await FarmUnit.findAll({
      where: { FarmBuildingId: farmBuildingId },
      limit,
      offset,
      order: [[orderField, sortType]],
    });
    return res.status(200).json(farmUnits);
  } catch (error) {
    return res.status(500).json({ message: 'Error while getting farm units!', error });
  }
};

exports.countDown = async () => {
  try {
    const farmBuildings = await FarmBuilding.findAll({
      attributes: ['id', 'feedingCountdown'],
    });
    const promises = [];
    const buildingIdsForResetFarmUnitLostHealth = [];
    for (const farmBuilding of farmBuildings) {
      promises.push(farmBuilding.update({ feedingCountdown: farmBuilding.feedingCountdown - 1 }));
      if (farmBuilding.feedingCountdown - 1 === config.countdownBuilding - 1) {
        buildingIdsForResetFarmUnitLostHealth.push(farmBuilding.id);
      }
    }
    const farmUnits = await FarmUnit.findAll({
      where: {
        FarmBuildingId: { [Op.in]: buildingIdsForResetFarmUnitLostHealth },
      },
    });
    for (const farmUnit of farmUnits) {
      promises.push(farmUnit.update({
        currentLostHealth: 0,
        previousLostHealth: farmUnit.currentLostHealth,
      }));
    }
    return Promise.all(promises);
  } catch (error) {
    return Promise.resolve();
  }
};
