const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    channel: { type: mongoose.Schema.ObjectId, ref: "Channel" },
    name: { type: String, required: true },
    recipes: [{ type: mongoose.Schema.ObjectId, ref: 'Recipe' }],
    photo: { type: String, required: true },
    cloudinary_id: { type: String, required: true },
    time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Playlist', playlistSchema);