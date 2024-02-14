
const express = require('express');

const router = express.Router();

const userProjectController = require('../../controllers/userProjectController');

var authValidator = require("../../validation/authValidator")

router.post('/createuserProject', authValidator.createuserProjectupdate(), userProjectController.createuserProject);

router.get('/getAlluserProject', userProjectController.getAlluserProject);

router.delete('/deleteuserProject/:id', userProjectController.deleteuserProject);

router.put('/updateuserProject/:id', userProjectController.updateuserProject);

module.exports = router;
