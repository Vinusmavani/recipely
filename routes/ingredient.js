const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ingredient = require('../models/ingredients');
const Category = require('../models/category');
const category = require('../models/category');
const recipe = require('../models/recipe');
const { json } = require('body-parser');

router.get("/search/ingredient/:name", function (req, res) {
    var regex = new RegExp(req.params.name, 'i');
    Ingredient.find({ name: regex }).then((result) => {
        res.status(200).json(result)
    })
});

router.post("/post/ingredient", (req, res, next) => {
    Category.findById(req.body.categoryId)
        .then(category => {
            if (!category) {
                return res.status(404).json({
                    message: "category not found"
                });
            }
            const ingredient = new Ingredient({
                _id: mongoose.Types.ObjectId(),
                name: req.body.name,
                category: req.body.categoryId
            });
            return ingredient.save();
        })
        .then(result => {
            return res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.get("/getAll/ingredient", (req, res, next) => {
    Ingredient.find()
        .select(' name category ')
        .populate('category', ['name', 'photo'])
        .exec()
        .then(docs => {
            return res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

//todo 
router.get("/getingredient/bycategory/:categoryId", (req, res, next) => {
    Ingredient.find({ category: req.params.categoryId })
        .select(' name category ')
        .populate('category', ['name', 'photo'])
        .exec()
        .then(docs => {
            const arr = []
            docs.map(item => {
                arr.push({ name: item.name, id: item.id })
            })
            data = {
                id: docs[0].category.id,
                name: docs[0].category.name,
                photo: docs[0].category.photo,
                arr: arr
            }
            return res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.get("/getallingredient/byallcategory", (req, res, next) => {
    Ingredient.find()
        .select(' name category ')
        .populate('category')
        .exec()
        .then(docs => {
          

      const dumarr = []
            docs.map((item, index) => {
                if (item.category?.name) {
                    dumarr.push(item.category?.name)
                }
            })
            const uniqVal = [...new Set(dumarr)]

            // console.log("dumarr", uniqVal);
            const finallarr = []
            uniqVal.map((item) => {
                const arr = []
                let id = ""
                let PhotoUrl = ""
                let isMore = ""
                docs.map(subItem => {
                    if (subItem.category?.name === item) {
                        console.log(subItem.category)
                        id = subItem.category._id,
                        PhotoUrl = subItem.category.photo,
                        isActive = subItem.category.isMore
                        arr.push({ id: subItem._id, name: subItem.name, isActive: subItem.category.isMore })
                    }
                })
                finallarr.push({ id, photo: PhotoUrl, category_name: item, isMore: isActive, arr})
            })

            // console.log(finallarr)
            return res.status(200).json(finallarr);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.get("/filter/list", (req, res, next) => {
    const { dataarr } = req.body

    console.log([...dataarr])

    recipe.find({ ingre: { $in: dataarr } })
        .exec()
        .then(docs => {
            return res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.get('/get/oneingredient/:ingredientId', (req, res, next) => {
    const id = req.params.ingredientId;
    Ingredient.findById(id)
        .select('name category')
        .populate('category', ['name', 'photo'])
        .exec()
        .then(docs => {
            const response = {
                Ingredient: docs,
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

// don't need now
// router.patch('/updateingredient/:ingredientId', (req, res, next) => {
//     const id = req.params.ingredientId;
//     const updateOps = {};
//     for (const ops of req.body) {
//         updateOps[ops.propName] = ops.value;
//     }
//     Ingredient.updateOne({ _id: id }, { $set: updateOps })
//         .exec()
//         .then(result => {
//             // console.log(result);
//             return res.status(200).json({
//                 message: 'Ingredient Updated'
//             });
//         })
//         .catch(err => {
//             // console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
// })

router.delete('/deleteingredient/:ingredientId', (req, res, next) => {
    const id = req.params.ingredientId;
    Ingredient.deleteOne({ _id: id })
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