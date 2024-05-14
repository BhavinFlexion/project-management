const routes = require('express').Router();

routes.use('/', require('./user.routes'));

module.exports = routes;