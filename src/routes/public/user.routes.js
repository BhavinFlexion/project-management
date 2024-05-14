const express = require('express');

const router = express.Router();

var authValidator = require("../../validator/authValidator")

var userController = require('../../controllers/usercontroller');

router.post('/sign-up', authValidator.signup(), userController.signUp);

router.post('/sign-In', authValidator.signIn(), userController.signIn);

router.post('/resend-otp', userController.resendOTP);

router.post('/verify-otp',authValidator.verification(), userController.verifyOtp);

router.post('/forgotPassword',authValidator.forgotPass(), userController.forgotPassword);

router.post('/resetPassword', authValidator.resetPass(), userController.resetPassword);

router.get('/get-User', userController.getUser);

router.delete('/delete-User/:id', userController.deleteUser);

router.put('/update-User/:id', userController.updateUser);

module.exports = router;