const express = require('express');

const router = express.Router();

const ProjectController = require('../../controllers/projectController');

var authValidator = require("../../validation/authValidator")

router.post('/createProject', authValidator.createProjectupdate(), ProjectController.createProject);

router.get('/getAllProject', ProjectController.getAllProject);

router.delete('/deleteProject/:id', ProjectController.deleteProject);

router.put('/updateProject/:id', ProjectController.updateProject);

module.exports = router;