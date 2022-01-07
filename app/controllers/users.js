const User = require('../models/user');

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.createOne = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUserData = { username, email, password };
    const newUser = await User.create(newUserData);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.updateOne = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUserData = { username, email, password };
    const newUser = await User.update(newUserData, { where: { id: req.params.id } });
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const user = await User.destroy({ where: { id: req.params.id } });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};
