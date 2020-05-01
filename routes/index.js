var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var Area = require('../models/chennai');
var middleware = require('../middleware');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var Comment = require('../models/comment');
require('dotenv').config()

// root route
router.get('/', function (req, res) {
    res.render('landing');
});

// ===========
// Auth Routes
// ===========

//register
router.get('/register', function (req, res) {
    res.render('register');
});

// register logic
router.post('/register', function (req, res) {
    newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
            newUser.email = req.body.email;
            if (req.body.avatar) {
                newUser.avatar = req.body.avatar;
            }
            if (req.body.adminCode === 'vijayselvan45') {
                newUser.isAdmin = true;
            }
            async.waterfall([
                function (done) {
                    User.register(newUser, req.body.password, function (err, user) {
                        if (err) {
                            return res.render("register", { error: err.message });
                        }
                        passport.authenticate('local')(req, res, function () {
                            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
                            res.redirect('/area');
                            done(err, user);
                        })
                    })
                },
                function (user, done) {
                    var smtpTransport = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'vijaiselvanvj@gmail.com',
                            pass: process.env.GMAILPW
                        }
                    });
                    var mailOptions = {
                        to: user.email,
                        from: 'vijaiselvanvj@mail.com',
                        subject: 'WELCOME TO CHENNAI TOURISM PAGE',
                        text: 'Hello,\n\n' +
                            'Thankyou ' + user.username + ' for signing in\n\n' + 'You are ready to view Beautiful places in chennai by clicking this link ' + 'http://' + req.headers.host
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                        done(err);
                    });
                }
            ])
        }
        else if (err || user) {
            req.flash("error", "EmailID already exists");
            return res.redirect('/register');
        }
    });

    // User.register(newUser, req.body.password, function (err, user) {
    //     if (err) {
    //         req.flash("error", err.message);
    //         return res.redirect('/register');
    //     }
    //     passport.authenticate('local')(req, res, function () {
    //         req.flash("success", "Welcome to Chennai " + user.username);
    //         res.redirect('/area');
    //     })
    // })
    // ===================
})

// login
router.get('/login', function (req, res) {
    res.render('login');
});

// login logic
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            req.flash("error", "Invalid Username or password")
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/area';
            delete req.session.redirectTo;
            req.flash("success", 'Welcome back ' + req.user.username)
            res.redirect(redirectTo);
        });
    })(req, res, next);
});
// router.post('/login', function (req, res, next) {
//     passport.authenticate('local',
//         {
//             successRedirect: '/area',
//             failureRedirect: '/login',
//             failureFlash: true,
//             successFlash: "Welcome to YelpCamp, " + req.body.username + "!"
//         })(req, res);
// });

//logout
router.get('/logout', function (req, res) {
    req.flash("success", "Successfully logged out");
    req.logout();
    res.redirect('/area');
});

// USER PROFILE
router.get('/users/:id', function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash('error', 'Something went wrong.');
            res.redirect('/area');
        }
        else {
            Area.find().where('user.id').equals(foundUser._id).exec(function (err, areas) {
                if (err) {
                    req.flash('error', 'Something went wrong.');
                    res.redirect('/area');
                }
                else {
                    res.render('users/show', { user: foundUser, areas: areas });
                }
            })
        }
    })
})

//EDIT user profile
router.get('/users/:id/edit', middleware.checkUserOwnership, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            req.flash('error', 'Something went wrong.');
            res.redirect('/area');
        }
        else {
            res.render('users/edit', { user: user });
        }
    })
})

//UPDATE user profile
router.put('/users/:id/', middleware.checkUserOwnership, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            req.flash('error', 'Something went wrong.');
            res.redirect('/area');
        }
        else {
            if (req.body.adminCode === 'vijayselvan45') {
                user.isAdmin = true;
            }
            else {
                user.isAdmin = false;
            }
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            user.avatar = req.body.avatar;
            Comment.find().where('author.id').equals(user._id).exec(function (err, comment) {
                comment.forEach(function (comment) {
                    comment.author.avatar = req.body.avatar;
                    comment.save()
                })
            });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("/users" + req.params.id + '/edit');
                } else {
                    res.redirect("/users/" + req.params.id);
                }
            });
        }
    })
});

//Forgot password
router.get('/forgot', function (req, res) {
    res.render('users/forgot');
});

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'vijaiselvanvj@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'vijaiselvanvj@gmail.com',
                subject: 'Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
                    'Expires in 1 Hour'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'vijaiselvanvj@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'vijaiselvanvj@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n',
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/area');
    });
});

//RESET page
router.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('users/reset', { token: req.params.token });
    });
});




module.exports = router;