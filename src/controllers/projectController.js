const Project = require("../models/projects");

const User = require("../models/users");

const WorkspaceUsers = require("../models/workspaceusers");

const Workspace = require("../models/workspace");

const UserProject = require("../models/userProject");

const moment = require('moment')

const { sendEmail } = require("../helper/email.helper");

const { ROLE_FIELD,TYPES_FIELD, STATUS_FIELD, EMAILCONSTANT } = require("../helper/constant");

exports.projectcreate = async (req, res) => { 
  try {
    const { name, role, permissions, status, workspaceId } = req.body;

    const userId = req.user.id;
    const findUser = await User.findByPk(userId);
    if (!findUser) {
        return res.status(400).json({ status: false, message: res.__("USERCREATEDBY_DOES_NOT_EXIST") });
    }
    
    const findWorkspace = await Workspace.findOne({where:{id: workspaceId}});
    if(!findWorkspace){
      return res.status(400).json({ status: false, message: res.__("WORKSPACEID_NOT_EXIST") });
    }
    
    const workspaceUser = await WorkspaceUsers.findOne({
        where: {
          userId :userId,
          workspaceId: findWorkspace.id,
          status: STATUS_FIELD.ACTIVE
        }
    });

    if (!workspaceUser) {
        return res.status(400).json({ status: false, message:  res.__("WORKSPACEUSER_PROVIDED_USERID_DOES_NOTEXIST") });
    }

    if (workspaceUser.role !== ROLE_FIELD.OWNER && workspaceUser.role !== ROLE_FIELD.MANAGER) {
        return res.status(403).json({ status: true, message:  res.__("OWNER_MANAGER_ADD_PERMISSION") });
    }

    const { email } = findUser;
    if (!email) {
      return res.status(400).json({ status: false, message: res.__("EMAIL_NOT_FOUND") });
    }

    const createObj = {
        name,
        role,
        permissions,
        status,
        userId,
        workspaceId: findWorkspace.id
    };

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: email,
      ProjectName: name,
      role: role,
    };
    sendEmail(email, EMAILCONSTANT.PROJECT, templateData);

    const project = await Project.create(createObj);
    if (project) {
        return res.status(201).json({ status: true, message: res.__("PROJECT_CREATED_SUCCESSFULLY"), data: project });
    } else {
        return res.status(404).json({ status: false, message: res.__("USER_NOT_FOUND") });
    }
} catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
}
};

exports.getAllProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const findUser = await User.findByPk(userId);
  
    if (!findUser) {
      return res.status(404).json({ status: false, message: res.__("USER_NOT_FOUND") });
    }

    let { page = 1, pageSize = 10 } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    let projects;

  if (findUser.role === ROLE_FIELD.OWNER || findUser.role === ROLE_FIELD.MANAGER ) {
      const userWorkspaces = await WorkspaceUsers.findAll({ where: { userId } });
      const workspaceIds = userWorkspaces.map(workspace => workspace.workspaceId);

      projects = await Project.findAndCountAll({
        include: [
          {
            model: Workspace,
            where: { id: workspaceIds },
          }
        ],
        where: {
          status: STATUS_FIELD.ACTIVE
        },
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
    } else {
      const userProjects = await UserProject.findAll({ where: { userId } });
      const projectIds = userProjects.map(userProject => userProject.projectId);
  
      await Project.update(
        { status: STATUS_FIELD.ACTIVE },
        { where: { id: projectIds, status: STATUS_FIELD.ACTIVE } }  
      );
  
      projects = await Project.findAndCountAll({
        include: [
          {
            model: UserProject,
            where: { userId },
          }
        ],
        where: {
          status: STATUS_FIELD.ACTIVE
        },
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
    }
  
    const totalPages = Math.ceil(projects.count / pageSize);
  
    res.json({status: true, message: res.__("PROJECTS_RETRIEVED_SUCCESSFULLY"), 
        totalCount: projects.count,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: pageSize,
        projects: projects.rows
      
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
      
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const findUser = await User.findByPk(userId);

    if (!findUser || (findUser && findUser.role !== ROLE_FIELD.PROJECT_MANAGER && findUser.type !== TYPES_FIELD.ORGANISATION)) {
      return res.status(403).json({ status: false, message: res.__("USER_NOT_FOUND") });
    }

    const projectData = await Project.findByPk(projectId);

    if (!projectData) {
      return res.status(404).json({ status: false, message: res.__("PROJECT_NOT_FOUND") });
    }
    let findUserProject = await UserProject.findOne({
      where: {
        userId,
        projectId
      }
    })
    if (!findUserProject) {
      return res.status(403).json({ status: false, message: res.__("USER_NOT_ASSOCIATED_WITH_PROJECT") });
    }

    if (findUserProject.role!== ROLE_FIELD.OWNER || findUserProject.role !== ROLE_FIELD.PROJECT_MANAGER) {
      return res.status(403).json({ status: false, message: res.__("USER_NOT_PROJECT_MANAGER") });
    }

    await Project.update(
      { status: STATUS_FIELD.DEACTIVE },
      { where: { id: projectId } }
    );

    res.status(200).json({ status: true, message: res.__("PROJECT_DELETED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const updateData = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;

    const findUser = await User.findByPk(userId);

    if (!findUser) {
      return res.status(403).json({ status: false, message: res.__("USER_NOT_FOUND") });
    }

    const findProject = await Project.findByPk(projectId);
    if (!findProject) {
      return res.status(404).json({ status: false, message: res.__("PROJECT_NOT_FOUND") });
    }

    const userWorkspace = await WorkspaceUsers.findOne({
      where: {
        userId: userId,
        workspaceId: findProject.workspaceId
      }
    });

    if (!userWorkspace) {
      return res.status(403).json({ status: false, message: res.__("USER_NOT_ASSOCIATED_WITH_WORKSPACE") });
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
      return res.status(400).json({ status: 400, message: res.__("NOFIELDS_UPDATE") });
    }

    const data = await Project.update(updateFields, {
      where: { id: projectId }
    });

    if (data === 0) {
      return res.status(404).json({ status: false, message: res.__("PROJECT_NOT_FOUND") });
    }

    return res.status(200).json({ status: true, message: res.__("PROJECT_UPDATED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

//  userProject data

exports.userProjectcreate = async (req, res) => {
  try {
    let { role, permissions, projectId, status, userId } = req.body;

    const logInUserId = req.user.id;
    
    const logInUser = await User.findByPk(logInUserId);

    if (!logInUser) {
      return res.status(400).json({ status: false, message: res.__("USERCREATEDBY_DOES_NOT_EXIST") });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(400).json({ status: false, message: res.__("USERPROJECTID_DOES_NOTEXIST") });
    }

    if (permissions.includes(ROLE_FIELD.MANAGE_MEMBER)) {
      if (![ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER].includes(logInUser.role)) {
        return res.status(403).json({ status: false, message: res.__("OWNER_MANAGER_ADDPERMISSIONS") });
      }
    }

    const userInProject = await UserProject.findOne({ where: { userId: logInUserId, projectId: projectId } });
    if (userInProject) {
      return res.status(400).json({ status: false, message: res.__("USER_ALREADY_ASSIGNED_TO_PROJECT") });
    }

    const userToAdd = await User.findByPk(userId);

    if (!userToAdd) {
        return res.status(400).json({ status: false, message: res.__("USER_TO_ADD_DOES_NOT_EXIST") });
    }

    const { email } = userToAdd;
    if (!email) {
        return res.status(400).json({ status: false, message: res.__("EMAIL_NOT_FOUND") });
    }
    
    const createObj = {
      role,
      permissions,
      projectId,
      userId,
      status,
    };

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: email,
      userProjectName: project.name,
      role: role,
    };
    sendEmail(email, EMAILCONSTANT.USERPROJECT, templateData);

    const data = await UserProject.create(createObj);
    if (data) {
      return res.status(201).json({status: true, message: res.__("CREATED_SUCCESSFULLY"), data: data });
    } else {
      return res.status(404).json({ status: false, message: res.__("DATA_NOT_FOUND") });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAlluserProject = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
  
    const userProject = await UserProject.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });
  
    const userId = req.user.id;
    const userData = await User.findByPk(userId);
  
    let data;
    if (userData.role !== ROLE_FIELD.OWNER) {
      data = await UserProject.findAndCountAll({
        where: { status: STATUS_FIELD.ACTIVE },
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });
    } 
  
    res.json({ 
      status: true, 
      message: res.__("USERPROJECT_RETRIEVED_SUCCESSFULLY"), 
      totalCount: userProject.count,
      totalPages: Math.ceil(userProject.count / limit),
      currentPage: parseInt(page),
      pageSize: limit,
      data: data ? data.rows : [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteuserProject = async (req, res) => {
  try {
    const userProjectId = req.params.id;
    const userProjects = await UserProject.findByPk(userProjectId);

    if (!userProjects) {
      return res.status(404).json({ status: false, message: res.__("USERPROJECT_NOT_FOUND") });
    }

    if (userProjects.role === ROLE_FIELD.OWNER || (userProjects.role === ROLE_FIELD.MANAGER && userProjects.role !== ROLE_FIELD.MANAGER)) {
      await UserProject.update(
        { status: STATUS_FIELD.DEACTIVE },
        { where: { id: userProjectId } }
      );

      return res.status(200).json({ status: true, message: res.__("USERPROJECT_DELETED_SUCCESSFULLY") });
    } else {
      return res.status(403).json({ status: false, message: res.__("UNAUTHORIZED_DELETE_USERPROJECT") });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.updateuserProject = async (req, res) => {
  try {
    const updateData = req.body;
    const userProjectId = req.params.id;

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
      return res.status(400).json({ status: false, message: res.__("NOFIELDS_UPDATE")});
    }

    const data = await UserProject.update(updateFields, {
      where: {
        id: userProjectId,
      },
      returning: true,
    });

    if (data === 0) {
      return res.status(404).json({ status: false, message: res.__("UERPROJECT_NOT_FOUND") });
    }
    res.status(200).json({status: true,message: res.__("USERPROJECT_UPDATED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500) .json({message: error.message });
  }
};