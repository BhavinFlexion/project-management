const express = require('express');

const router = express.Router();

const CommentController = require('../../controllers/CommentController');

var authValidator = require("../../validation/authValidator")

router.post('/Commentcreate', authValidator.Commentupdate(), CommentController.Commentcreate);

router.get('/getAllComment', CommentController.getAllComment);

router.delete('/deleteComment/:id', CommentController.deleteComment);

router.put('/updateComment/:id', CommentController.updateComment);

module.exports = router;