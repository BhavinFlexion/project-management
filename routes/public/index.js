const routes = require('express').Router();

routes.use('/', require('./userRoutes'));

module.exports = routes;