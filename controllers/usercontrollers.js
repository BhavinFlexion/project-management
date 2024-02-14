const User = require("../models/users");

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const { Op } = require('sequelize');

const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, description, type, role, status } = req.body;

    if (email === password || username === password) {
      return res.status(400).json({ message: 'Username and password cannot be the same' });
    }

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashPassword

    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
      firstName,
      lastName,
      description,
      type,
      role,
      status,
    });
    res.status(201).json(newUser.toJSON());

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = await User.findOne({ where: { email, username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, "secret-key", { expiresIn: '1h' });
    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getUsers = async (req, res) => {
  const data = await User.findAll({})
  res.status(200).json({ data: data });
};

const getUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, role, search } = req.query;

    const filterOptions = {};
    if (type) {
      filterOptions.type = type;
    }
    if (role) {
      filterOptions.role = role;
    }

    if (search) {
      filterOptions[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const userList = await User.findAll({
      where: filterOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalCount = await User.count({ where: filterOptions });
    res.status(200).json({
      data: userList,
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deletingUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userdata = await User.findByPk(userId);

    if (!userdata) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }
    await User.update({ status: 'Deactive' }, { where: { id: userId } });
    res.status(200).json({ status: true, message: 'User deleted successfully' });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const updateData = req.body;
    const userId = req.params.id;

    let updateFields = {};
    for (const key in updateData) {
      if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
        updateFields[key] = updateData[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ status: 400, message: 'No valid fields to update' });
    }

    const data = await User.update(updateFields, {
      where: {
        id: userId
      },
      returning: true
    });

    if (data === 0) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }
    res.status(200).json({ status: 200, message: 'User data updated successfully', });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  getUser,
  deletingUser,
  updateUser,
};