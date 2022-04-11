const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Comment = require("../models/comment")
const User = require("../models/user")

router.post('/post/comment', (req, res, next) => {
    const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        user: req.body.userid,
        recipe: req.body.recipeid,
        comment: req.body.comment
    });
    comment
        .save()
        .then(docs => {
            const response = {
                message: 'handling post request in /comment',
                createdComment: docs
            }
            return res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/getonecomment/:commentId', (req, res, next) => {
    const id = req.params.commentId;
    Comment.findById(id)
        .select(' userid recipeid comment rating visibility ')
        .populate('user', 'name')
        .exec()
        .then(comment => {
            if (!comment) {
                return res.status(404).json({
                    message: "Comment not found"
                });
            }
            res.status(200).json({
                Comment: comment,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/comment"
                }
            });
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get("/getCommentRecipe/:recipeId", (req, res) => {
    Comment.find({ recipe: req.params.recipeId })
    .then(result => {
        return res.status(200).json(result);
    })
    .catch(err => {
        // console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

router.get("/get/Allcomment", (req, res) => {
    Comment.find()
    .then(result => {
        return res.status(200).json(result);
    })
    .catch(err => {
        // console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

router.delete('/deletecomment/:commentId', (req, res, next) => {
    const id = req.params.commentId;
    Comment.deleteOne({ _id: id })
        .exec()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;