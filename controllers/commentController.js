const Comment = require('../models/comments');

const Task = require('../models/tasks');

const User = require('../models/users');

const { validateInteger } = require('../helper/utils');

const Commentcreate = async (req, res) => {
    try {
        let { comment, createdAt, createdBy, taskId, status } = req.body;

        createdBy = req.user.id;
        validateInteger(taskId, 'taskId');

        const user = await User.findByPk(createdBy);
        const task = await Task.findByPk(taskId);
        if (!user) {
            return res.status(400).json({ status: false, message: 'User with the provided userId does not exist' });
        }

        if (!task) {
            return res.status(400).json({ status: false, message: 'Project with the provided taskId does not exist' });
        }

        const createObj = {
            comment,
            createdAt,
            createdBy,
            taskId,
            status
        };
        const data = await Comment.create(createObj);
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

const getAllComment = async (req, res) => {
    try {
        const data = await Comment.findAll();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteComment = async (req, res) => {
    try {
        const CommentId = req.params.id;
        const Commentdata = await Comment.findByPk(CommentId);

        if (!Commentdata) {
            return res.status(404).json({ status: 404, message: 'Comment not found' });
        }
        await Comment.update({ status: 'Deactive' }, { where: { id: CommentId } });
        res.status(200).json({ status: true, message: 'Comment deleted successfully' });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }

};

const updateComment = async (req, res) => {
    try {
        const updateData = req.body;
        const CommentId = req.params.id;

        let updateFields = {};
        for (const key in updateData) {
            if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
                updateFields[key] = updateData[key];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ status: 400, message: 'No valid fields to update' });
        }

        const data = await Comment.update(updateFields, {
            where: {
                id: CommentId
            },
            returning: true
        });

        if (data === 0) {
            return res.status(404).json({ status: 404, message: 'Comment not found' });
        }
        res.status(200).json({ status: 200, message: 'Comment data updated successfully', });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

module.exports = {
    Commentcreate,
    getAllComment,
    deleteComment,
    updateComment,
};