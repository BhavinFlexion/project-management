const { where } = require('sequelize');

const Workspace = require('../models/workspace');

const User = require('../models/users');

const createWorkspace = async (req, res) => {
  try {
    const { name, description, status, organisation_id, createdBy } = req.body;

    (organisation_id, 'organisation_id');
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ status: true, message: 'User with the provided organisation_id does not exist' });
    }
    else {
      if (user.type !== "Organisation") {
        return res.status(401).json({ status: true, message: 'you are not authorised to create workspace' });
      }
    }
    const createObj = {
      name,
      description,
      status,
      organisation_id: req.user.id,
      createdBy: req.user.id
    };
    const data = await Workspace.create(createObj);
    if (data) {
      return res.status(201).json({ status: true, message: 'Data created successfully', data: data });
    } else {

      return res.status(404).json({ status: false, message: 'Data not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
  }
};

const getAllWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    const workspaces = await Workspace.findAll({
      where: { createdBy: userId }
    });

    res.json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteWorkspaces = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      return res.status(404).json({ status: 404, message: 'Workspace not found' });
    }
    await Workspace.update({ status: 'Deactive' }, { where: { id: workspaceId } });
    res.status(200).json({ status: true, message: 'Workspace deleted successfully' });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};

const updateWorkspaces = async (req, res) => {
  try {
    const updateData = req.body;
    const workspaceId = req.params.id;

    let updateFields = {};
    for (const key in updateData) {
      if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
        updateFields[key] = updateData[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ status: 400, message: 'No valid fields to update' });
    }

    const data = await Workspace.update(updateFields, {
      where: {
        id: workspaceId
      },
      returning: true
    });

    if (data === 0) {
      return res.status(404).json({ status: 404, message: 'Workspace not found' });
    }
    res.status(200).json({ status: 200, message: 'Workspace data updated successfully', });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};

module.exports = {
  createWorkspace,
  getAllWorkspaces,
  deleteWorkspaces,
  updateWorkspaces
};