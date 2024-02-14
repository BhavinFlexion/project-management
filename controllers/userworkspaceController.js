const UserWorkspace = require('../models/workspaceusers');

const User = require('../models/users');

const Workspace = require('../models/workspace');

const createuserWorkspace = async (req, res) => {
    try {
        let { email, role, workspaceId, status } = req.body;
        const ownerId = req.user.id;

        const owner = await User.findByPk(ownerId);
        if (!owner) {
            return res.status(403).json({ status: false, message: 'Only the workspace owner can invite users' });
        }

        let invitedUser = await User.findOne({ where: { email } });
        if (!invitedUser) {
            invitedUser = await User.create({ email, status: 'Invited' });
        }

        const existingWorkspaceUser = await UserWorkspace.findOne({
            where: {
                userId: invitedUser.id,
                workspaceId
            }
        });

        if (existingWorkspaceUser) {
            return res.status(400).json({ status: false, message: 'User is already a member of this workspace' });
        }

        const workspace = await Workspace.findByPk(workspaceId);
        if (!workspace) {
            return res.status(400).json({ status: false, message: 'Workspace with the provided workspaceId does not exist' });
        }

        const createObj = {
            role,
            workspaceId,
            userId: invitedUser.id,
            status
        };

        const data = await UserWorkspace.create(createObj);
        if (data) {
            if (status === 'Active') {
                return res.status(201).json({ status: true, message: 'UserWorkspace created successfully', data: data });
            } else if (status === 'Deleted') {
                return res.status(201).json({ status: true, message: 'UserWorkspace created successfully. Invitation rejected.', data: data });
            }
        }

        return res.status(404).json({ status: false, message: 'Failed to create UserWorkspace' });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAlluserWorkspaces = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await UserWorkspace.findAll({
            where: { userId }
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteuserWorkspaces = async (req, res) => {
    try {
        const userWorkspacesId = req.params.id;
        const userWorkspacesdata = await UserWorkspace.findByPk(userWorkspacesId);

        if (!userWorkspacesdata) {
            return res.status(404).json({ status: 404, message: 'UserWorkspace not found' });
        }
        if (!req.user.isAdmin && req.user.id !== userWorkspacesdata.userId) {
            return res.status(403).json({ status: 403, message: 'Unauthorized to delete this user workspace' });
        }

        await UserWorkspace.update({ status: 'Deactive' }, { where: { id: userWorkspacesId } });
        res.status(200).json({ status: true, message: 'UserWorkspace deleted successfully' });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

const updateuserWorkspaces = async (req, res) => {
    try {
        const updateData = req.body;
        const userWorkspacesId = req.params.id;

        let updateFields = {};
        for (const key in updateData) {
            if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
                updateFields[key] = updateData[key];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ status: 400, message: 'No valid fields to update' });
        }

        const data = await UserWorkspace.update(updateFields, {
            where: {
                id: userWorkspacesId
            },
            returning: true
        });

        if (data === 0) {
            return res.status(404).json({ status: 404, message: 'userWorkspaces not found' });
        }
        res.status(200).json({ status: 200, message: 'userWorkspaces data updated successfully', });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

module.exports = {
    createuserWorkspace,
    getAlluserWorkspaces,
    deleteuserWorkspaces,
    updateuserWorkspaces
};