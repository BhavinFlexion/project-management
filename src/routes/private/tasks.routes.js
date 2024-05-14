const express = require("express");

const router = express.Router();

const tasksController = require("../../controllers/tasksController");

var authValidator = require("../../validator/authValidator");

router.post( "/create",authValidator.createtasksupdate(),tasksController.taskscreate);

router.get("/get", tasksController.getAlltasks);

router.delete("/delete/:id", tasksController.deletetasks);

router.put("/update/:id", tasksController.updatetasks);

module.exports = router;
