const express = require('express');

const router = express.Router();

const userworkspaceController = require('../../controllers/userworkspaceController');

// var authValidator = require("../../validation/authValidator")

router.post('/createuserWorkspace', userworkspaceController.createuserWorkspace);

router.get('/getAlluserWorkspaces', userworkspaceController.getAlluserWorkspaces);

router.delete('/deleteuserWorkspaces/:id', userworkspaceController.deleteuserWorkspaces);

router.put('/updateuserWorkspaces/:id', userworkspaceController.updateuserWorkspaces);

module.exports = router;
