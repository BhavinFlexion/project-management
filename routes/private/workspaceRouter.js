const express = require('express');

const router = express.Router();

const workspaceController = require('../../controllers/workspaceController');

var authValidator = require("../../validation/authValidator")

router.post('/createWorkspace', authValidator.Workspaceupdate(), workspaceController.createWorkspace);

router.get('/getAllWorkspaces', workspaceController.getAllWorkspaces);

router.delete('/deleteWorkspaces/:id', workspaceController.deleteWorkspaces);

router.put('/updateWorkspaces/:id', workspaceController.updateWorkspaces);

module.exports = router;


