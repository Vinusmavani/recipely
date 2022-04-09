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

var transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'derrick.reichel42@ethereal.email',
        pass: '411pmPRXxQSS2UydW6'
    }
    // tls: {
    //     rejectUnauthorized: false
    // }
})

router.post('/signup/user', async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = new User({
            username,
            email,
            password,
            emailToken: crypto.randomBytes(64).toString('hex'),
            isVerified: false
        })
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(user.password, salt)
        user.password = hashPassword
        const newUser = await user
            .save()
        var mailOptions = {
            from: 'verify@recipely.com',
            to: user.email,
            subject: 'Recipely Account Activation Link',
            html: `
            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                    <tbody><tr>
                        <td align="center">
                            <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tbody><tr>
                                    <td align="center" valign="top" background="https://github.com/Recipely-Project-2022/recipely_2022/blob/main/src/Images/recipe%20fixed.png?raw=true" bgcolor="#000000;" style="background-size:cover; background-position:top; height="400""="">
                                        <table class="col-600" width="600" height="400" border="0" align="center" cellpadding="0" cellspacing="0">
                                            <tbody><tr>
                                                <td height="40"></td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="line-height: 0px;">
                                                    <img style="display:block; line-height:0px; font-size:0px; border:0px;" src="https://github.com/Recipely-Project-2022/recipely_2022/blob/main/src/Images/Reciply%20Final%20logo.png?raw=true" width="200" height="200" alt="logo">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="font-family: 'Raleway', sans-serif; font-size:37px; color:#ffffff; text-shadow: #000 0.1px 0 5px; line-height:24px; font-weight: bold; letter-spacing: 2px;">
                                                    WELCOME, <span style="font-family: 'Raleway', sans-serif; font-size:37px; color:#F68712; line-height:39px; font-weight: 300; letter-spacing: 2px;"> ${user.name} To Recipely</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="font-family: 'Lato', sans-serif; font-size:15px; color:#ffffff; line-height:24px; font-weight: 300;">
                        <span style="color:#F68712; text-shadow: #000 0.1px 0 5px;">Recipely</span> Is a recipe search engine <br> that lets you search by ingredients you have at home.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="50"></td>
                                            </tr>
                                        </tbody></table>
                                    </td>
                                </tr>
                            </tbody></table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0" style="margin-left:20px; margin-right:20px; border-left: 1px solid #dbd9d9; border-right: 1px solid #dbd9d9;">
                                <tbody><tr>
                                    <td height="35"></td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-family: 'Raleway', sans-serif; font-size:22px; font-weight: bold; color:#000000;">A creative way to showcase your content</td>
                                </tr>
                                <tr>
                                    <td height="10"></td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300; ">
                          <br>Create a recipe and add playlist so easily access recipe. <br>Find thousands of recipes you can make right now with <span style="color:#F68712;">The Recipely</span>
                                    </td>
                                </tr>            
                            </tbody></table>
                    <br />
                    <a href="http://${req.headers.host}/user/verify-email?token=${user.emailToken}" style="font-family: 'Open Sans', Arial, sans-serif; font-size:13px; color: #FFFFFF; background-color: #F68712; padding:10px; padding-right:20px; padding-left:20px; border-radius: 5px 5px 0px 0px; text-decoration: none; font-family: 'Raleway', sans-serif; font-size:20px; font-weight: bold; letter-spacing: 2px;">Activate Account</a>
                    <div style="background-color: #F68712; height: 25px; width:600px; align:center;"></div>
                        </td>
                    </tr>            
            `
        }

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error)
            } else {
                console.log('Verification email is sent to your gmail account');
            }
        })
            // .then(result => {
            //     console.log(result);
                res.status(201).json({
                    message: 'User created'
                });
            // })
            // .catch(err => {
            //     console.log(err);
            //     res.status(500).json({
            //         error: err
            //     })
            // });
        // res.redirect('/user/login')
    }
    catch (err) {
        console.log(err);
    }
})

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SIGNIN_KEY)
}

router.post('/signin/user', async (req, res) => {
    try {
        const { email, password } = req.body
        const findUser = await User.findOne({ email: email })
        if (findUser) {
            const match = await bcrypt.compare(password, findUser.password)
            if (match) {
                const token = createToken(findUser.id)
                console.log(token);
                res.cookie('access-token', token)
                // res.redirect('/dashboard')
                return res.status(200).json("signin sucsess")
            } else {
                return res.json({ error: err })
            }
        }
        else {
            console.log('User is not registered');
        }
    }
    catch (err) {
        console.log(err);
    }
})

router.get('/verify/email', async(req, res) => {
    try{
        const token = req.query.token
        const user = await User.findOne({ emailToken : emailToken})
        if(user){
            user.emailToken = null
            user.isVerified = true
            await user.save()
            // res.redirect('/user/login')
            res.status(200).json("login")
        } else {
            res.status(200).json("register")
            // res.redirect('/user/register')
            console.log('email is not verified');
        }
    } catch (err){
        console.log(err);
    }
})

// router.post('/signin', (req, res) => {
//     const { email, password } = req.body;
//     User.findOne({ email }).exec((err, user) => {
//         if (!user) {
//             return res.status(400).json({
//                 error: "This user does not exist, signup first"
//             })
//         }
//         if (user.password !== password) {
//             return res.status(400).json({
//                 error: "Email or password incorrect"
//             })
//         }
//         const token = jwt.sign({ _id: user._id }, process.env.JWT_SIGNIN_KEY, { expiresIn: '7d' });
//         const { _id, username, email } = user;

//         res.json({
//             token,
//             user: { _id, username, email }
//         })
//     })
// })

router.get('/logout/user', (req, res) => {
    res.cookie('access-token', "", { maxAge: 1 })
    res.redirect('/user/login')
})

router.patch("/update/user", (req, res) => {
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

router.get('/get/user', (req, res, next) => {
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

router.get('/get/username/:username', (req, res, next) => {
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

router.delete('/delete/user/:userId', (req, res, next) => {
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