const tasks = require('../models/tasks');

const Project = require('../models/projects');

const UserProject = require('../models/userproject');

const User = require('../models/users');

const createtasks = async (req, res) => {
    try {
        let { title, description, status, progress, createdBy, assignedTo, projectId, estimationTime, spendTime } = req.body;

        createdBy = req.user.id;
        assignedTo = req.user.id;
        (projectId, 'projectId');

        const user = await User.findByPk(createdBy);
        const assigne = await User.findByPk(assignedTo);
        const projecte = await Project.findByPk(projectId);


        if (!user) {
            return res.status(400).json({ status: false, message: 'User with the provided createdBy does not exist' });
        }

        if (!assigne) {
            return res.status(400).json({ status: false, message: 'User with the provided assignedTo does not exist' });
        }

        if (!projecte) {
            return res.status(400).json({ status: false, message: 'Project with the provided projectId does not exist' });
        }

        const UserInProject = await UserProject.findOne({ where: { userId: assignedTo } });
        if (!UserInProject) {
            return res.status(400).json({ status: false, message: 'User is not associated with the project' });
        }

        const createObj = {
            title,
            description,
            status,
            progress,
            createdBy,
            assignedTo,
            projectId,
            estimationTime,
            spendTime,
        };
        const data = await tasks.create(createObj);
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

const getAlltasks = async (req, res) => {
    try {
        const { status, assignee, projectId } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (assignee) filter.assignee = assignee;
        if (projectId) filter.projectId = projectId;

        const data = await tasks.findAll({ where: filter });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deletetasks = async (req, res) => {
    try {
        const taskId = req.params.id;
        const tasksdata = await tasks.findByPk(taskId);

        if (!tasksdata) {
            return res.status(404).json({ status: 404, message: 'tasks not found' });
        }
        await tasks.update({ status: 'Deactive' }, { where: { id: taskId } });
        res.status(200).json({ status: true, message: 'tasks deleted successfully' });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

const updatetasks = async (req, res) => {
    try {
        const updateData = req.body;
        const taskseId = req.params.id;

        let updateFields = {};
        for (const key in updateData) {
            if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
                updateFields[key] = updateData[key];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ status: 400, message: 'No valid fields to update' });
        }

        const data = await tasks.update(updateFields, {
            where: {
                id: taskseId
            },
            returning: true
        });

        if (data === 0) {
            return res.status(404).json({ status: 404, message: 'tasks not found' });
        }
        res.status(200).json({ status: 200, message: 'tasks data updated successfully', });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

module.exports = {
    createtasks,
    getAlltasks,
    deletetasks,
    updatetasks,
};