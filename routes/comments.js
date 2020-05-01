var express = require('express');
var router = express.Router({ mergeParams: true });
var Area = require('../models/chennai');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//================
// COMMENTS ROUTES
//================

//NEW route
router.get('/new', middleware.isLoggedin, function (req, res) {
    Area.findById(req.params.id, function (err, foundArea) {
        if (err || !foundArea) {
            req.flash('error', 'Area to be commented is not found');
            res.redirect('/area');
        }
        else {
            res.render('comments/new', { area: foundArea });
        }
    })
});

//CREATE route
router.post('/', middleware.isLoggedin, function (req, res) {
    Area.findById(req.params.id, function (err, foundArea) {
        if (err || !foundArea) {
            req.flash('error', 'Area to be commented is not found');
            res.redirect('/area');
        }
        else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    res.redirect('back');
                }
                else {
                    //add username and id to comments
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.avatar = req.user.avatar;
                    //save comments
                    comment.save();
                    foundArea.comments.push(comment);
                    foundArea.save();
                    res.redirect('/area/' + req.params.id)
                }
            })
        }
    })
});

//EDIT
router.get('/:commentid/edit', middleware.checkCommentOwnership, function (req, res) {
    Area.findById(req.params.id, function (err, foundArea) {
        if (err || !foundArea) {
            req.flash("error", "The area to update the comment is not found")
            return res.redirect('/area');
        }
        Comment.findById(req.params.commentid, function (err, foundComment) {
            if (err) {
                res.redirect('back');
            }
            else {
                res.render('comments/edit', { comment: foundComment, areaId: req.params.id });
            }
        })
    })
})

//UPDATE route
router.put('/:commentid', middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.commentid, req.body.comment, function (err) {
        if (err) {
            res.redirect('back');
        }
        else {
            res.redirect('/area/' + req.params.id);
        }
    })
})

//DELETE route
router.delete('/:commentid', middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndDelete(req.params.commentid, function (err) {
        if (err) {
            res.redirect('back');
        }
        else {
            req.flash("success", "comment deleted")
            res.redirect('/area/' + req.params.id);
        }
    })
})


module.exports = router;