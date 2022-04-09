const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieparser = require("cookie-parser")
require('dotenv').config();
const cors = require("cors");
const app = express();

const user = require('./routes/user');
const avatar = require('./routes/avatar');
const recipe = require('./routes/recipe');
const ingredient = require('./routes/ingredient');
const category = require('./routes/category');
const comment = require('./routes/comment');
const playlist = require('./routes/playlist');

mongoose.connect('mongodb+srv://vinus:vinus@cluster0.rpksm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true })

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieparser())
app.use(express.json())

app.use('/user', user);
app.use('/avatar', avatar);
app.use('/recipe', recipe);
app.use('/ingredient', ingredient);
app.use('/category', category);
app.use("/comment", comment);
app.use("/playlist", playlist);

app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;   