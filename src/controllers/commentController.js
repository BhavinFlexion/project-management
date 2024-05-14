const Comment = require("../models/comments");

const Task = require("../models/tasks");

const User = require("../models/users");

const { validateInteger } = require("../helper/utils");

const { STATUS_FIELD , EMAILCONSTANT } = require("../helper/constant");

const moment = require('moment')

const { sendEmail } = require("../helper/email.helper");

exports.commentcreate = async (req, res) => {
  try {
    let { comment, createdAt, createdBy, taskId, status } = req.body;

    createdBy = req.user.id;

    const findUser = await User.findByPk(createdBy);
    const userTask = await Task.findByPk(taskId);
  
    if (!findUser) {
      return res.status(400).json({ status: false, message: res.__("USERID_DOESNOT_EXIST") });
    }

    if (!userTask) {
      return res.status(400).json({ status: false, message: res.__("PROJECT_PROVIDED_TASKID_DOESNOT_EXIST") });
    }

    const { email } = findUser;
    if (!email) {
      return res.status(400).json({ status: false, message: res.__("EMAIL_NOT_FOUND") });
    }

    const createObj = {
      comment, createdAt,createdBy, taskId, status,
    };

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: findUser.email,
      comment: userTask.title,
      role: findUser.role,
    };
    sendEmail(email, EMAILCONSTANT.COMMENT, templateData);

    const data = await Comment.create(createObj);
    if (data) {
      return res.status(201).json({ status: true, message: res.__("CREATED_SUCCESSFULLY"), data: data,});
    } else {
      return res.status(404).json({ status: false, message: res.__("DATA_NOT_FOUND") });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllComment = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, taskId} = req.query;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const comments = await Comment.findAndCountAll({
      where: taskId,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: 200,
      message: res.__("Comments_Retrieved_Successfully"),
      totalComments: comments.count,
      totalPages: Math.ceil(comments.count / pageSize),
      currentPage: page,
      page: pageSize,
      comments: comments.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const findComment = await Comment.findByPk(commentId);

    if (!findComment) {
      return res.status(404).json({ status: false, message: res.__("COMMENT_NOT_FOUND") });
    }

    if (findComment.createdBy !== userId) {
      return res.status(403).json({ status: false, message: res.__("UNAUTHORIZED_DELETE_COMMENT") });
    }

    await Comment.update({ status: STATUS_FIELD.DEACTIVE }, { where: { id: commentId } });

    res.status(200).json({ status: true, message: res.__("COMMENT_DELETED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const updateData = req.body;
    const commentId = req.params.id;
    const userId = req.user.id;

    const findComment = await Comment.findByPk(commentId);

    if (!findComment) {
        return res.status(404).json({ status: false, message: res.__("COMMENT_NOT_FOUND") });
    }

    if (findComment.createdBy !== userId) {
        return res.status(403).json({ status: false, message: res.__("UNAUTHORIZED_UPDATE_COMMENT") });
    }

    let updateFields = {};
    for (const key in updateData) {
        if (
            updateData[key] !== null &&
            updateData[key] !== undefined &&
            updateData[key] !== ""
        ) {
            updateFields[key] = updateData[key];
        }
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ status: false, message: res.__("NOFIELDS_UPDATE") });
    }

    const data = await Comment.update(updateFields, {
        where: { id: commentId },
    });

    if (data === 0) {
        return res.status(404).json({ status: false, message: res.__("COMMENT_NOT_FOUND") });
    }

    res.status(200).json({ status: true, message: res.__("COMMENT_UPDATED_SUCCESSFULLY") });
  } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({message: error.message });
  }
};