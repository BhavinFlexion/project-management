const Workspace = require("../models/workspace");

const UserWorkspace = require("../models/workspaceusers");

const User = require("../models/users");

const { STATUS_FIELD , EMAILCONSTANT, TYPES_FIELD } = require("../helper/constant");

const moment = require('moment');

const { sendEmail } = require("../helper/email.helper");

const path = require('path');

exports.WorkspaceCreate = async (req, res) => {
  try {
    const { name, description, status, } = req.body;

    const findUser = await User.findByPk(req.user.id);
    if (!findUser) {
      return res.status(400).json({status: true, message: res.__("ORGANIZATIONID_NOT_EXIST"),});
    } else {
      if (findUser.type !== TYPES_FIELD.ORGANISATION) {
        return res.status(401).json({ status: true,message: res.__("AUTHORISED_CREATEWORKSPACE_FAILED")});
      }
    }
    
    const { email } = findUser;
    if (!email) {
      return res.status(400).json({ status: false, message: res.__("EMAIL_NOT_FOUND")});
    }

    const createObj = {
      name,
      description,
      status,
      organisation_id: req.user.id,
      createdBy: req.user.id,
    };

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: email,
      workspaceName: name,
      role: findUser.role,
    };
    sendEmail(email, EMAILCONSTANT.WORKSPACE, templateData);
    
    const data = await Workspace.create(createObj);
    if (data) {
      return res.status(201).json({ status: true, message: res.__("CREATED_SUCCESSFULLY"), data: data,});
    } else {
      return res.status(404).json({ status: false, message: res.__("USER_NOT_FOUND")});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAllWorkspaces = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
  
    const userId = req.user.id;
  
    const data = await Workspace.findAndCountAll({
      where: { createdBy: userId },
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });
  
    const totalCount = data.count;
  
    res.status(200).json({
      status: true,
      message: res.__("WORKSPACES_RETRIEVED_SUCCESSFULLY"),
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      pageSize: limit,
      data: data.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.id;
    const findWorkspace = await Workspace.findByPk(workspaceId);

    if (!findWorkspace) {
      return res.status(404).json({ status: false, message: res.__("WORKSPACE_NOT_FOUND") });
    }

    if (findWorkspace.createdBy!== userId) {
      return res.status(403).json({ status: false, message: res.__("UNAUTHORIZED_DELETE_WORKSPACE") });
    }

    await Workspace.update(
      { status: STATUS_FIELD.DEACTIVE },
      { where: { id: workspaceId } }
    );
    res.status(200).json({ status: true, message: res.__("WORKSPACE_DELETED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({message: error.message });
  }
};

exports.updateWorkspaces = async (req, res) => {
  try {
    const updateData = req.body;
    const workspaceId = req.params.id;
    const userId = req.user.id;

    const findUser = await User.findByPk(userId);
    if (!findUser) {
      return res.status(400).json({status: true, message: res.__("ORGANIZATIONID_NOT_EXIST"),});
    } else {
      if (findUser.type !== TYPES_FIELD.ORGANISATION) {
        return res.status(401).json({ status: true,message: res.__("AUTHORISED_CREATEWORKSPACE_FAILED"),});
      }
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

    const data = await Workspace.update(updateFields, {
      where: {
        id: workspaceId,
      },
      returning: true,
    });

    if (data === 0) {
      return res.status(404).json({ status: false, message: res.__("WORKSPACE_NOT_FOUND") });
    }
    res.status(200).json({ status: true, message: res.__("WORKSPACE_UPDATED_SUCCESSFULLY") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// userworkspace data

exports.userWorkspacecreate = async (req, res) => {
  try {
    let { email, role, workspaceId, status } = req.body;

    const ownerId = req.user.id;
    
    const findOwner = await User.findByPk(ownerId);
    if (!findOwner) {
      return res.status(403).json({ status: false, message: res.__("OWNER_INVITED_USERS") });
    }

    let invitedUser = await User.findOne({ where: { email } });
    if (!invitedUser) {
      invitedUser = await User.create({ email, status: STATUS_FIELD.INVITED });
    }
   
    const findWorkspace = await Workspace.findByPk(workspaceId);
    if (!findWorkspace) {
      return res.status(400).json({ status: false, message: res.__("WORKSPACEID_NOT_EXIST") });
    }

    const findWorkspaceUser = await UserWorkspace.findOne({
      where: {
        userId: invitedUser.id,
        workspaceId,
      },
    });

    if (findWorkspaceUser) {
      return res.status(400).json({ status: false, message: res.__("ALREADY_MEMBER") });
    }
 
    const createObj = {
      role,
      workspaceId,
      userId: invitedUser.id,
      status,
    };

    let templateData = {
      date: moment().format('DD-MM-YYYY HH:mm:ss'),
      email: email,
      WorkspaceName : findWorkspace.name,
      role: role,
  }
  sendEmail(email, EMAILCONSTANT.WORKAPCE_INVITED, templateData)

    const data = await UserWorkspace.create(createObj);
    if (data) {
      if (status === STATUS_FIELD.ACTIVE) {
        return res.status(201).json({status: true,message: res.__("USERWORKSPACE_CREATED_SUCCESSFULLY"),data: data,});
      } else if (status === STATUS_FIELD.PENDING) {
        return res.status(201).json({status: true,message: res.__("USERWORKSPACECREATED_INVITATIONREJECTED"),data: data,});
      }
    }
    return res.status(404).json({ status: false, message: res.__("USERWORKSPACE_CREATION_FAILED") });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlluserWorkspaces = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
  
    const userId = req.user.id;
  
    const userWorkspaces = await UserWorkspace.findAndCountAll({
      where: { userId: userId },
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });
  
    const totalCount = userWorkspaces.count;
  
    const data = userWorkspaces.rows;
  
    res.json({
      status: true,
      message: res.__("USERWORKSPACES_RETRIEVED_SUCCESSFULLY"),
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      pageSize: limit,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
  
exports.deleteuserWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const userWorkspacesId = req.params.id;
    const findUserWorkspaceData = await UserWorkspace.findByPk(userWorkspacesId);

    if (!findUserWorkspaceData) {
      return res.status(404).json({ status: true, message: res.__("USERWORKSPACE_NOT_FOUND") });
    }

    const workspaceId = findUserWorkspaceData.workspaceId;
    const findWorkspace = await Workspace.findByPk(workspaceId);

    if (findWorkspace && findWorkspace.createdBy !== userId) {
      return res.status(403).json({ status: false, message: res.__("UNAUTHORIZED_DELETE_USERWORKSPACE") });
    }

    await UserWorkspace.update(
      { status: STATUS_FIELD.DEACTIVE },
      { where: { id: userWorkspacesId } }
    );

    res.status(200).json({ status: true, message: res.__("USERWORKSPACE_DELETED") });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.updateuserWorkspaces = async (req, res) => {
    try {
      const updateData = req.body;
      const userWorkspacesId = req.params.id;
      const userId = req.user.id;
  
      const userWorkspace = await UserWorkspace.findByPk(userWorkspacesId);
      if (!userWorkspace) {
        return res.status(404).json({ status: false, message: res.__("USERWORKSPACE_NOT_FOUND") });
      }
  
      const workspaceId = userWorkspace.workspaceId;
      const workspace = await Workspace.findByPk(workspaceId);
  
      if (workspace && workspace.createdBy !== userId) {
        return res.status(403).json({ status: false, message: res.__("UNAUTHORIZED_UPDATE_USERWORKSPACE") });
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
  
      const data = await UserWorkspace.update(updateFields, {
        where: {
          id: userWorkspacesId,
        },
        returning: true,
      });
  
      if (data === 0) {
        return res.status(404).json({ status: false, message: res.__("USERWORKSPACE_NOT_FOUND") });
      }
      res.status(200).json({status: true ,message: res.__("USERWORKSPACES_UPDATED_SUCCESSFULLY"), });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({message: error.message });
    }
};