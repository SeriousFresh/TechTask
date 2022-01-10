const db = require('../models/db');

const {
  FarmBuilding,
  FarmUnit,
  FarmUnityType,
} = db;

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
    let farmBuildings = await FarmBuilding.findAll({
      include: [
        { model: FarmUnit, as: 'farmUnits' },
        { model: FarmUnityType },
      ],
      attributes: ['id', 'name', 'FarmUnityTypeId'], // ,[sequelize.fn('COUNT', sequelize.col('FarmUnit.id')), 'numberOfFarmUnits']],
    });
    farmBuildings = farmBuildings.map((farmBuilding) => mapFarmBuilding(farmBuilding));
    return res.status(200).json(farmBuildings);
  } catch (error) {
    console.log(error);
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
    await FarmBuilding.update(newFarmBuildingData, { where: { id: req.params.id } });
    return res.status(200).json({ message: 'Farm building successfully updated!' });
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
    return res.status(200).json("Building and it's units successfully deleted!");
  } catch (error) {
    return res.status(500).json({ message: "Error while deleting farm building and it's units!", error });
  }
};

exports.addFarmUnit = async (req, res) => {
  try {
    const { farmUnitId } = req.body;
    const farmBuildingId = req.params.id;
    const farmBuilding = await FarmBuilding.findByPk(farmBuildingId);
    if (!farmBuilding) return res.status(404).json({ message: 'Farm building by this ID does not exist!' });
    const farmUnit = await FarmUnit.findByPk(farmUnitId);
    if (!farmUnit) return res.status(404).json({ message: 'Farm unit by this ID does not exist!' });
    if (farmBuilding.FarmUnityTypeId !== farmUnit.FarmUnityTypeId) return res.status(403).json({ message: 'Farm building and farm unit are not from same unity type!' });
    await farmUnit.update({ FarmBuildingId: farmBuildingId });
    return res.status(200).json({ message: 'Farm unit successfully added to the farm building!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error while adding farm unit to farm building!', error });
  }
};

exports.getAllFarmUnits = async (req, res) => {
  try {
    const farmBuildingId = req.params.id;
    const farmBuilding = await FarmBuilding.findByPk(farmBuildingId);
    if (!farmBuilding) return res.status(404).json({ message: 'Farm building for this ID does not exist!' });
    const farmUnits = await FarmUnit.findAll({
      where: { FarmBuildingId: farmBuildingId },
      attributes: ['id', 'health', 'isDead', 'FarmBuildingId'],
    });
    return res.status(200).json(farmUnits);
  } catch (error) {
    return res.status(500).json({ message: 'Error while getting farm units!', error });
  }
};
