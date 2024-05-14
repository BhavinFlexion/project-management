const express = require("express");

const router = express.Router();

const ProjectController = require("../../controllers/projectController");

var authValidator = require("../../validator/authValidator");

router.post("/create",authValidator.createProjectupdate(),ProjectController.projectcreate);

router.get("/get", ProjectController.getAllProject);

router.delete("/delete/:id", ProjectController.deleteProject);

router.put("/update/:id", ProjectController.updateProject);


// userProject router 

router.post( "/add-users",authValidator.createuserProjectupdate(),ProjectController.userProjectcreate);

router.get("/get-users", ProjectController.getAlluserProject);

router.delete("/delete-users/:id",ProjectController.deleteuserProject);

router.put("/update-users/:id", ProjectController.updateuserProject);

module.exports = router;