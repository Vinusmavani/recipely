const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require("../utils/cloudinary");
const upload = require('../utils/multer');

const Playlist = require("../models/playlist")
const Recipe = require("../models/recipe")

router.post('/postplaylist', upload.single('photo'), async (req, res, next) => {

    const result = await cloudinary.uploader.upload(req.file.path);
    const playlist = new Playlist({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        recipes: req.body.recipesid,
        photo: result.secure_url,
        cloudinary_id: result.public_id
    });
    await playlist.save()
        .then(result => {
            // console.log(result);
            return res.status(201).json({
                message: 'handling post request in /playlist',
                createdPlaylist: result
            });
        })
        .catch(err => {
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/getAllPlaylist', (req, res, next) => {
    Playlist.find()
        //TODO set limit
        .select(' name photo recipes time ')
        .populate('recipes', ['rname', 'Rpic'])
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                playlist: docs
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

//don't needed now
// router.get('/:playlistId', (req, res, next) => {
//     const id = req.params.playlistId;
//     Playlist.findById(id)
//         .select(' name photo recipes time ')
//         .populate('recipes', ['rname', 'Rpic'])
//         .exec()
//         .then(playlist => {
//             if (!playlist) {
//                 return res.status(404).json({
//                     message: "Playlist not found"
//                 });
//             }
//             res.status(200).json({
//                 Playlist: playlist,
//                 request: {
//                     type: "GET",
//                     url: "http://localhost:3000/comment"
//                 }
//             });
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: err
//             });
//         });
// });

router.put('/updatePlaylist/:id', upload.single('photo'), async (req, res) => {
    try {
        let playlist = await Playlist.findById(req.params.id);
        await cloudinary.uploader.destroy(playlist.cloudinary_id);
        const result = await cloudinary.uploader.upload(req.file.path);
        const data = {
            name: req.body.name || playlist.name,
            recipes: req.body.recipesid || playlist.recipesid,
            photo: result.secure_url || playlist.photo,
            cloudinary_id: result.public_id || playlist.cloudinary_id
        }
        playlist = await Playlist.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(playlist);
    } catch (err) {
        console.log(err);
    }
})

router.delete('/deletePlaylist/:id', async (req, res, next) => {
    try{  
      let playlist = await Playlist.findById(req.params.id);
  
      await cloudinary.uploader.destroy(playlist.cloudinary_id);
  
      await playlist.remove();
      res.json(message="playlist deleted");
      } catch (err) {
          console.log(err);
      }
  });

module.exports = router;