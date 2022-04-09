const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const _ = require("lodash");
const nodemailer = require("nodemailer");
const cookie = require("cookie-parser")

const User = require('../models/user')

router.post('/registeruser/signup', async(req, res) => {
    try{
        const{ username, email, password } = req.body
        const user = new User({
            username,
            email,
            password,
            emailToken : crypto.randomBytes(64).toString('hex'),
            isVerified: false
        }) 
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(user.password, salt)
        user.password = hashPassword
        const newUser = await user
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'User created'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
    }
    catch(err){
        console.log(err);
    }
})

const createToken = (id)=>{
    return jwt.sign({ id }, process.env.JWT_SIGNIN_KEY)
}

router.post('/login/user', async(req,res)=>{
    try{
        const{ email,password } = req.body
        const findUser = await User.findOne({email : email})
        if(findUser){
            const match = await bcrypt.compare(password, findUser.password)
            if(match){
                const token = createToken(findUser.id)
                console.log(token);
                res.cookie('access-token', token)
                res.redirect('/dashboard')
            } else {
                console.log();
            }
        }
        else { 
            console.log('User is not registered');
        }
    }
    catch(err){
        console.log(err);
    }
})

router.post('/signin', (req, res) => {
    const {email, password} = req.body;
    User.findOne({email}).exec((err, user) => {
        if (!user) {
            return res.status(400).json({
                error: "This user does not exist, signup first"
            })
        }
        if(user.password !== password) {
            return res.status(400).json({
                error: "Email or password incorrect"
            })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SIGNIN_KEY, { expiresIn: '7d' });
        const {_id, username, email} = user;

        res.json({
            token,
            user: {_id, username, email}
        })
    })
})

router.patch("/updateUser", (req, res) => {
    //update quary
    User.updateOne({ _id: req.body._id }, req.body)
        .then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        })
})

router.get('/getuser', (req, res, next) => {
    User.find()
        //TODO set limit
        .select('username email')
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

router.get('/getbyuserName/:username', (req, res, next) => {
    const regex = new RegExp(req.params.username);
    User.findOne({ username: regex })
        .select('username email')

        //TODO
        .populate("recipe_ids wishlist notification avtid")
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

router.delete('/:userId', (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            return res.status(200).json({
                message: 'user deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })

        });
})

module.exports = router;