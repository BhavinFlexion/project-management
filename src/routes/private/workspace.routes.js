const express = require('express');

const router = express.Router();

const workspaceController = require('../../controllers/workspaceController');

var authValidator = require("../../validator/authValidator")

router.post('/create', authValidator.Workspaceupdate(), workspaceController.WorkspaceCreate);

router.get('/get', workspaceController.getAllWorkspaces);

router.delete('/delete/:id', workspaceController.deleteWorkspaces);

router.put('/update/:id', workspaceController.updateWorkspaces);


// userworkspace routes

router.post('/add-users',authValidator.Workspaceuserupdate(), workspaceController.userWorkspacecreate);

router.get('/get-users', workspaceController.getAlluserWorkspaces);

router.delete('/delete-users/:id', workspaceController.deleteuserWorkspaces);

router.put('/update-users/:id', workspaceController.updateuserWorkspaces);

module.exports = router;