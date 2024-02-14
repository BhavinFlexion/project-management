const routes = require('express').Router();

routes.use('/workspace', require('../private/workspaceRouter'));

routes.use('/userworkspace', require('../private/userworkspaceRouter'));

routes.use('/project', require('../private/ProjectRouter'));

routes.use('/userProject', require('../private/userProjectRouter'));

routes.use('/tasks', require('../private/tasksRouter'));

routes.use('/comment', require('../private/commentRouter'));

module.exports = routes;