const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require("../utils/cloudinary");
const upload = require('../utils/multer');

const Category = require('../models/category');

router.post('/postcategory', upload.single('photo'), async (req, res, next) => {
    // try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const category = new Category({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        photo: result.secure_url,
        cloudinary_id: result.public_id
    });
    await category.save()
        .then(result => {
            const response = {
                message: 'handling post request in /Category',
                createdCategory: result
            }
            return res.status(200).json(response);
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
    // } catch (e) {
    //     res.status(500).json({
    //         message: "internal server error",
    //         error: e
    //     })
    // }
})

router.get('/getAllcategory', (req, res, next) => {
    Category.find()
        //TODO set limit
        .select('name photo')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                category: docs
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

router.get('/getonecategory/:categoryId', (req, res, next) => {
    const id = req.params.categoryId;
    Category.findById(id)
        .select('name photo')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                category: docs
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

router.delete('/deletecategory/:categoryid', async (req, res, next) => {
    try {
        let category = await Category.findById(req.params.categoryid);

        await cloudinary.uploader.destroy(category.cloudinary_id);

        await category.remove();
        res.json(message = "category deleted");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;