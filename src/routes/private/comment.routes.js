const express = require("express");

const router = express.Router();

const CommentController = require("../../controllers/commentController");

var authValidator = require("../../validator/authValidator");

router.post("/create",authValidator.Commentupdate(),CommentController.commentcreate);

router.get("/get", CommentController.getAllComment);

router.delete("/delete/:id", CommentController.deleteComment);

router.put("/update/:id", CommentController.updateComment);

module.exports = router;
