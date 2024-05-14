const routes = require("express").Router();

routes.use("/workspace", require("../private/workspace.routes"));

routes.use("/project", require("../private/project.routes"));

routes.use("/tasks", require("../private/tasks.routes"));

routes.use("/comment", require("../private/comment.routes"));

module.exports = routes;