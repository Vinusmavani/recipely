const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    photo: { type: String, required: true },
    cloudinary_id: { type: String, required: true },
    // totalrecipes: {type},
    time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('Playlist', playlistSchema);