const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require("../utils/cloudinary");
const upload = require('../utils/multer');

const Avatar = require('../models/avatar');

// function throwObjWithStacktrace() {
//     const someError = { statusCode: 500 }
//     Error.captureStackTrace(someError)
//     throw someError;
// }

router.post('/postavt', upload.single('avtpic'), async (req, res, next) => {
    const result = await cloudinary.uploader.upload(req.file.path);
    const avatar = new Avatar({
        _id: new mongoose.Types.ObjectId(),
        avtname: req.body.avtname,
        avtpic: result.secure_url,
        cloudinary_id: result.public_id
    });
    await avatar.save()
        .then(result => {
            // console.log(result);
            return res.status(201).json({
                message: 'handling post request in /Avatar',
                createdAvatar: result
            });
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/getAll', async (req, res, next) => {
    await Avatar.find()
        //TODO set limit
        // .select('name photo')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                Avatar: docs
            }
            return res.status(200).json(response);
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/getAvatar/:avatarId', async (req, res, next) => {
    const id = req.params.avatarId;
    await Avatar.findById(id)
        // .select('name photo')
        .exec()
        .then(docs => {
            const response = {
                Avatar: docs
            }
            return res.status(200).json(response);
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

router.get('/getbyavtname/:avtname', (req, res, next) => {
    const regex = new RegExp(req.params.avtname);
    Avatar.findOne({ avtname: regex })
        .select('avtname avtpic')

        //TODO
        // .populate("recipe_ids wishlist notification avtid")
        .exec()
        .then(docs => {
            const response = {
                Avatar: docs
            }
            return res.status(200).json(response);
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/deleteAvatar/:avtid', async (req, res, next) => {
    try {
        let avatar = await Avatar.findById(req.params.avtid);

        await cloudinary.uploader.destroy(avatar.cloudinary_id);

        await avatar.remove();
        res.json(message = "avatar deleted");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;