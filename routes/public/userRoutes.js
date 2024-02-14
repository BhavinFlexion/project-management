const express = require('express');

const router = express.Router();

var authValidator = require("../../validation/authValidator")

var usercontroller = require('../../controllers/usercontrollers');

router.post('/register', authValidator.signup(), usercontroller.register);

router.post('/login', authValidator.signIn(), usercontroller.login);

router.get('/getUsers', usercontroller.getUsers);

router.get('/getUser/:id', usercontroller.getUser);

router.delete('/deletingUser/:id', usercontroller.deletingUser);

router.put('/updateUser/:id', usercontroller.updateUser);

module.exports = router;