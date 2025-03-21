const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require("../utils/cloudinary");
const upload = require('../utils/multer');
const checkAuth = require('../middleware/check-auth');

const Recipe = require('../models/recipe');
const Channel = require('../models/channel');
const User = require('../models/user');

router.get("/searchrecipe/:name", function (req, res) {
    var regex = new RegExp(req.params.name, 'i');
    Recipe.find({ rname: regex }).then((result) => {
        res.status(200).json(result)
    })
});

router.get('/get/tutorial/:recipeId', (req, res, next) => {
    const id = req.params.recipeId;
    Recipe.findById({ _id: id })
        .select('rname ulink desc steps ingre ctime Rpic time')
        .populate('ingre', 'name')
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

router.get('/getall/recipes', (req, res, next) => {
    Recipe.find()
        //TODO set limit
        .select('rname ulink desc steps ingre ctime playlist Rpic time')
        .populate("ingre")
        .exec()
        .then(docs => {
            var i = 0;
            var temp = docs;
            var responcee = [];

            temp.map(value => {
                Channel.find({ recipe_ids: { "$in": [value._id] } })
                    .select("channelname -_id")
                    .then(result => {
                        value.chanalename = result;
                        responcee.push({value, chanalename: result})
                        i++;
                        if (i === docs.length) {
                            res.status(200).json({
                                total_recipes: responcee.length,
                                recipes: responcee
                            });
                            console.log(responcee[29]);
                        }
                        else { }
                    })
                    .catch(error => {
                        responcee.push([""])
                    })

            })

        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/post/recipe/:channelId', upload.single('Rpic'), async (req, res, next) => {
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
            console.log(result);
            Channel.updateOne({ _id: req.params.channelId }, { $push: { recipe_ids: result._id } }).then(result => {
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
            Channel.find({ recipe_ids: { "$in": [req.params.recipeId] } })
                .select("channelname -_id")
                .then(result => {
                    const response = {
                        // recipe: docs,
                        value : docs,
                        chanalename: result
                    }
                    return res.status(200).json(response);
                })

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/getrecipe/bychannel/:channelId', (req, res, next) => {
    Channel.findById(req.params.channelId)
        .select('recipe_ids')
        .populate('recipe_ids')
        .exec()
        .then(docs => {
            console.log(docs);
            const response = {
                // count: docs.length,
                recipes: docs
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})


router.post('/addfavourite/:userId', (req, res, next) => {
    User.updateOne({ _id: req.params.userId }, { $push: { favourite: req.body.recipeId } })
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
        .select('favourite')
        .populate('favourite')
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
    User.updateOne({ _id: req.params.userId }, { $pull: { favourite: req.body.recipeId } })
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
