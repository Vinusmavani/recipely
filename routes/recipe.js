const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require("../utils/cloudinary");
const upload = require('../utils/multer');
const checkAuth = require('../middleware/check-auth');

const Recipe = require('../models/recipe');
const User = require('../models/user');

router.get("/searchrecipe/:name", function (req, res) {
    var regex = new RegExp(req.params.name, 'i');
    Recipe.find({ rname: regex }).then((result) => {
        res.status(200).json(result)
    })
});

router.get('/getall/recipes', (req, res, next) => {
    Recipe.find()
        //TODO set limit
        .select('rname ulink desc steps ingre ctime visibility playlist Rpic time')
        .populate("ingre")
        .exec()
        .then(docs => {
            const response = {
                total_recipes: docs.length,
                recipes: docs
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

router.post('/post/recipe/:userId', upload.single('Rpic'), async (req, res, next) => {
    // try {
    // console.log(typeof (req.body.ingre))
    const result = await cloudinary.uploader.upload(req.file.path);
    const recipe = new Recipe({
        _id: new mongoose.Types.ObjectId(),
        rname: req.body.rname,
        ulink: req.body.ulink,
        desc: req.body.desc,
        steps: req.body.steps,
        ingre: req.body.ingre,
        ctime: req.body.ctime,
        playlist: req.body.playlist,
        Rpic: result.secure_url,
        cloudinary_id: result.public_id
    });
    await recipe.save()
        .then(result => {
            // console.log(result);
            User.updateOne({ _id: req.params.userId }, { $push: { recipe_ids: result._id } }).then(result => {
                return res.status(201).json({
                    message: 'handling post request in /recipe',
                    createdRecipe: result
                });
            })
        })
        .catch(err => {
            console.log(err);
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
});

router.get('/getrecipe/:recipeId', (req, res, next) => {
    const id = req.params.recipeId;
    Recipe.findById({ _id: id })
        // .select('rname ulink desc steps ingre ctime visibility playlist Rpic time')
        .populate('ingre playlist', 'name')
        .exec()
        .then(docs => {
            const response = {
                recipe: docs
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

router.post('/addfavourite/:userId', (req, res, next) => {
    User.updateOne({ _id: req.params.userId }, { $push: { wishlist: req.body.recipeId } })
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

router.get('/getfavourite/:userid', (req, res, next) => {
    User.findById(req.params.userid)
        .select('wishlist')
        .populate('wishlist')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs
            }
            res.status(200).json(response);
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

router.post('/removefavourite/:userId', (req, res, next) => {
    const id = req.params.recipeId;
    Recipe.findById({ _id: id })
    User.updateOne({ _id: req.params.userId }, { $pull: { wishlist: req.body.recipeId } })
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

router.put("/update/recipe/:id", upload.single('Rpic'), async (req, res) => {
    try {
        let recipe = await Recipe.findById(req.params.id);
        await cloudinary.uploader.destroy(recipe.cloudinary_id);
        const result = await cloudinary.uploader.upload(req.file.path);
        const data = {
            rname: req.body.rname || recipe.rname,
            ulink: req.body.ulink,
            desc: req.body.desc || recipe.desc,
            steps: req.body.steps || recipe.steps,
            ingre: req.body.ingre || recipe.ingre,
            ctime: req.body.ctime || recipe.ctime,
            playlist: req.body.playlist || recipe.playlist,
            Rpic: result.secure_url || recipe.Rpic,
            cloudinary_id: result.public_id || recipe.cloudinary_id
        };
        recipe = await Recipe.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(recipe);
    } catch (err) {
        console.log(err);
    }
})

router.delete('/delete/recipe/:recipeId', async (req, res, next) => {
    try {
        let recipe = await Recipe.findById(req.params.recipeId);

        await cloudinary.uploader.destroy(recipe.cloudinary_id);

        await recipe.remove();
        res.json(message = "recipe deleted");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
