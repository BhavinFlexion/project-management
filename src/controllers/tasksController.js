const tasks = require("../models/tasks");

const Project = require("../models/projects");

const UserProject = require("../models/userproject");

const User = require("../models/users");

const { STATUS_FIELD , EMAILCONSTANT, ROLE_FIELD} = require("../helper/constant");

const moment = require('moment')

const { sendEmail } = require("../helper/email.helper");

exports.taskscreate = async (req, res) => {
  try {
    let { title, description, status, progress, estimationTime, spendTime, projectId } = req.body;
    const userId = req.user.id;
    const findUser = await User.findByPk(req.user.id);

    if (!findUser) {
      return res.status(400).json({ status: false, message: res.__("USERCREATEDBY_DOES_NOT_EXIST") });
    }

    const findProject = await Project.findByPk(projectId);
    if (!findProject) {
        return res.status(400).json({ status: false, message: res.__("PROJECT_PROVIDEDID_DOESNOT_EXIST")});
    }

    const userInProject = await UserProject.findOne({ where: { userId, projectId } });
    if (!userInProject) {
        return res.status(403).json({ status: false, message: res.__("USERNOTASSOCIATED_WITH_PROJECT") });
    }

    const { email } = findUser;
    if (!email) {
      return res.status(400).json({ status: false, message: res.__("EMAIL_NOT_FOUND") });
    }

    const data = await tasks.create({
        title,
        description,
        status,
        progress,
        estimationTime,
        spendTime,
        projectId,
        createdBy: userId,
        assignedTo: userId 
    });

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: findUser.email,
      title: title,
      ProjectName: findProject.name,
      role: findUser.role,
    };
    sendEmail(email, EMAILCONSTANT.TASK, templateData);

    return res.status(201).json({ status: true, message: res.__("DATA_NOT_FOUND") , data });
} catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
}
};

exports.getAlltasks = async (req, res) => {
  try {
    const { status, assignee, projectId, page = 1, pageSize = 10 } = req.query;
  
    const filter = {};
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (projectId) filter.projectId = projectId;
  
    const offset = (page - 1) * pageSize;
  
    const data = await tasks.findAndCountAll({
      where: filter,
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });
  
    const totalTasks = data.count;
  
    const totalPages = Math.ceil(totalTasks / parseInt(pageSize));
  
    res.json({
      status: true,
      message: res.__("TASK_RETRIEVED_SUCCESSFULLY"),
      currentPage: parseInt(page),
      totalPages: parseInt(pageSize),
      totalTasks: totalTasks,
      totalPages: totalPages,
      data: data.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
  
};

exports.deletetasks = async (req, res) => {
  try {
    const taskId = req.params.id;
    const findTask = await tasks.findByPk(taskId);

    if (!findTask) {
      return res.status(404).json({ status: 404, message: res.__("TASKS_NOT_FOUND") });
    }

    const userId = req.user.id;
    
    if (findTask.createdBy !== userId) {
      return res.status(403).json({ status: 403, message: res.__("UNAUTHORIZED") });
    }

    await tasks.update(
      { status: STATUS_FIELD.DEACTIVE },
      { where: { id: taskId } }
    );

    res.status(200).json({ status: true, message: res.__("TASKS_DELETED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.updatetasks = async (req, res) => {
    try {
      const updateData = req.body;
      const taskId = req.params.id;
      const userId = req.user.id;
  
      const findTask = await tasks.findByPk(taskId, {
        include: [
          {
            model: Project,
            include: [
              {
                model: User,
                where: { id: userId },
              },
            ],
          },
        ],
      });
      if (!findTask) {
        return res.status(404).json({ status: false, message: res.__("TASKS_NOT_FOUND") });
      }
  
      let updateFields = {};
      for (const key in updateData) {
        if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== "") {
          updateFields[key] = updateData[key];
        }
      }
  
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ status: false, message: res.__("NOFIELDS_UPDATE") });
      }
  
      const data = await tasks.update(updateFields, {
        where: {
          id: taskId,
        },
      });
  
      if (data === 0) {
        return res.status(404).json({ status: false, message: res.__("TASKS_NOT_FOUND") });
      }
      res.status(200).json({ status: true, message: res.__("TASKS_UPDATED_SUCCESSFULLY") });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: error.message});
    }
};