const Project = require('../models/projects');

const User = require('../models/users');

const WorkspaceUsers = require('../models/workspaceusers');

const { ROLE_FIELD } = require('../helper/constant');

const createProject = async (req, res) => {
    try {
        const { name, organisation, role, permissions, status } = req.body;

        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ status: false, message: 'User with the provided createdBy does not exist' });
        }

        const workspaceUser = await WorkspaceUsers.findOne({
            where: {
                userId,
                role: 'Owner',
                status: 'Active'
            }
        });

        if (!workspaceUser) {
            return res.status(400).json({ status: false, message: 'WorkspaceUser with the provided userId does not exist' });
        }
        const workspaceId = workspaceUser.workspaceId;

        if (permissions.includes(ROLE_FIELD.MEMBER) && ![ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER].includes(user.role)) {
            return res.status(403).json({ status: true, message: 'Only owner or manager can add "manage member" permission' });
        }

        const createObj = {
            name,
            organisation,
            role,
            permissions,
            status,
            userId,
            workspaceId
        };

        const project = await Project.create(createObj);
        if (project) {
            return res.status(201).json({ status: true, message: 'Project created successfully', data: project });
        } else {
            return res.status(404).json({ status: false, message: 'Data not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await Project.findAll({
            where: { userId }
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.id;

        const projectData = await Project.findByPk(projectId);

        if (!projectData) {
            return res.status(404).json({ status: 404, message: 'Project not found' });
        }

        if (projectData.userId !== userId) {
            return res.status(403).json({ status: false, message: 'Only the owner of the project can delete it' });
        }
        await Project.update({ status: 'Deactive' }, { where: { id: projectId } });

        res.status(200).json({ status: true, message: 'Project deleted successfully' });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

const updateProject = async (req, res) => {
    try {
        const updateData = req.body;
        const ProjectId = req.params.id;

        let updateFields = {};
        for (const key in updateData) {
            if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
                updateFields[key] = updateData[key];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ status: 400, message: 'No valid fields to update' });
        }

        const data = await Project.update(updateFields, {
            where: {
                id: ProjectId
            },
            returning: true
        });

        if (data === 0) {
            return res.status(404).json({ status: 404, message: 'Project not found' });
        }
        res.status(200).json({ status: 200, message: 'Project data updated successfully', });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

module.exports = {
    createProject,
    getAllProject,
    deleteProject,
    updateProject
};


