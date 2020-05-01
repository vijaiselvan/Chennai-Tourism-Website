var middlewareObj = {};
var Area = require('../models/chennai');
var Comment = require('../models/comment');
var User = require('../models/user')

middlewareObj.checkAreaOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Area.findById(req.params.id, function (err, foundArea) {
            if (err || !foundArea) {
                req.flash("error", "Area not found");
                res.redirect('back');
            }
            else {
                if (foundArea.user.id.equals(req.user._id) || (req.user.isAdmin)) { // Built in method that comes with mongoose
                    next();
                }
                else {
                    req.flash("error", "You don't have permission to do that!")
                    res.redirect('back');
                }
            }
        })
    }
    else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect('back');
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.commentid, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect('/area/' + req.params.id);
            }
            else {
                if (foundComment.author.id.equals(req.user._id) || (req.user.isAdmin)) { // Built in method that comes with mongoose
                    next();
                }
                else {
                    req.flash("error", "You don't have permission to do that!")
                    res.redirect('back');
                }
            }
        })
    }
    else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect('back');
    }
}

middlewareObj.isLoggedin = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        req.session.redirectTo = req.originalUrl;
        req.flash("error", "You have to login to do that");
        res.redirect('/login');
    }
};

middlewareObj.checkUserOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.params.id, function (err, foundUser) {
            if (err || !foundUser) {
                req.flash("error", "User not found");
                res.redirect('/users/' + req.params.id);
            }
            else {
                if (foundUser._id.equals(req.user._id)) { // Built in method that comes with mongoose
                    next();
                }
                else {
                    req.flash("error", "You don't have permission to do that!")
                    res.redirect('back');
                }
            }
        })
    }
    else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect('back');
    }
}

module.exports = middlewareObj;