
const userProject = require('../models/userproject');

const User = require('../models/users');

const Project = require('../models/projects');

const createuserProject = async (req, res) => {
    try {
        let { role, permissions, projectId, userId, status } = req.body;

        userId = req.user.id;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(400).json({ status: false, message: 'User with the provided createdBy does not exist' });
        }

        (projectId, 'projectId')
        const projecte = await Project.findByPk(projectId);

        if (!projecte) {
            return res.status(400).json({ status: false, message: 'Project with the provided projectId does not exist' });
        }

        if (permissions.includes('manage member') && !['owner', 'manager'].includes(user.role)) {
            return res.status(403).json({ status: true, message: 'Only owner or manager can add "manage member" permission' });
        }

        const createObj = {
            role,
            permissions,
            projectId,
            userId,
            status,
        };

        const data = await userProject.create(createObj);
        if (data) {
            return res.status(201).json({ status: true, message: 'Data created successfully', data: data });
        } else {
            return res.status(404).json({ status: false, message: 'Data not found' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAlluserProject = async (req, res) => {
    try {
        const data = await userProject.findAll();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteuserProject = async (req, res) => {
    try {
        const userProjectId = req.params.id;
        const userProjectdata = await userProject.findByPk(userProjectId);

        if (!userProjectdata) {
            return res.status(404).json({ status: 404, message: 'userProject not found' });
        }
        await userProject.update({ status: 'Deactive' }, { where: { id: userProjectId } });
        res.status(200).json({ status: true, message: 'userProject deleted successfully' });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

const updateuserProject = async (req, res) => {
    try {
        const updateData = req.body;
        const userProjectId = req.params.id;

        let updateFields = {};
        for (const key in updateData) {
            if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
                updateFields[key] = updateData[key];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ status: 400, message: 'No valid fields to update' });
        }

        const data = await userProject.update(updateFields, {
            where: {
                id: userProjectId
            },
            returning: true
        });

        if (data === 0) {
            return res.status(404).json({ status: 404, message: 'userProject not found' });
        }
        res.status(200).json({ status: 200, message: 'userProject data updated successfully', });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

module.exports = {
    createuserProject,
    getAlluserProject,
    deleteuserProject,
    updateuserProject
};