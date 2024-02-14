const express = require('express');

const router = express.Router();

const tasksController = require('../../controllers/tasksController');

var authValidator = require("../../validation/authValidator")

router.post('/createtasks', authValidator.createtasksupdate(), tasksController.createtasks);

router.get('/getAlltasks', tasksController.getAlltasks);

router.delete('/deletetasks/:id', tasksController.deletetasks);

router.put('/updatetasks/:id', tasksController.updatetasks);

module.exports = router;