var express = require('express');
var router = express.Router();
var Area = require('../models/chennai');
var Comment = require('../models/comment')
var methodOverride = require('method-override');
var middleware = require('../middleware');
// INDEX - show all the area

router.get('/', function (req, res) {
    Area.find({}, function (err, areas) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('areas/index', { areas: areas });
        }
    })
});

// CREATE - create an area

router.post('/', middleware.isLoggedin, function (req, res) {
    var name = req.body.name;
    var location = req.body.location;
    var image = req.body.image;
    var description = req.body.description;
    var user = {
        id: req.user._id,
        username: req.user.username
    }
    var newArea = { name: name, location: location, image: image, description: description, user: user };
    Area.create(newArea, function (err, newArea) {
        if (err) {
            res.redirect('back');
        }
        else {
            res.redirect('/area');
        }
    })
});

// NEW -show form to create a new area

router.get('/new', middleware.isLoggedin, function (req, res) {
    res.render('areas/new');
});

// SHOW - show the description of that area

router.get('/:id', function (req, res) {
    Area.findById(req.params.id).populate("comments likes").exec(function (err, foundArea) {
        if (err || !foundArea) {
            req.flash("error", "Area not found")
            res.redirect('/area');
        }
        else {
            res.render('areas/show', { area: foundArea });
        }
    })
});

//EDIT route
router.get('/:id/edit', middleware.checkAreaOwnership, function (req, res) {
    Area.findById(req.params.id, function (err, foundArea) {
        res.render('areas/edit', { area: foundArea });
    });
});

//UPDATE route
router.put('/:id', middleware.checkAreaOwnership, function (req, res) {
    Area.findById(req.params.id, function (err, area) {
        if (err) {
            console.log(err);
            res.redirect("/area");
        } else {
            area.name = req.body.area.name;
            area.location = req.body.area.location;
            area.description = req.body.area.description;
            area.image = req.body.area.image;
            area.save(function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("/area" + req.params.id + '/edit');
                } else {
                    res.redirect("/area/" + area._id);
                }
            });
        }
    });
})

//DELETE area
router.delete('/:id', middleware.checkAreaOwnership, function (req, res) {
    Area.findById(req.params.id, function (err, foundArea) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundArea.comments.length > 0) {
                foundArea.comments.forEach(function (comment) {
                    Comment.findByIdAndDelete(comment, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                })
            }
        }
    })
    Area.findByIdAndDelete(req.params.id, function (err, foundArea) {
        if (err) {
            res.redirect('/area/' + req.params.id);
        }
        else {
            req.flash("success", "Successfully deleted " + foundArea.name)
            res.redirect('/area');
        }
    })
})

// Area Like Route
router.post("/:id/like", middleware.isLoggedin, function (req, res) {
    Area.findById(req.params.id, function (err, foundArea) {
        if (err) {
            req.flash("error", "Area not found")
            return res.redirect("/area");
        }

        // check if req.user._id exists in foundArea.likes
        var foundUserLike = foundArea.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundArea.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundArea.likes.push(req.user);
        }

        foundArea.save(function (err) {
            if (err) {
                console.log(err);
                req.flash("error", "something went wrong")
                return res.redirect("/area");
            }
            return res.redirect("/area/" + foundArea._id);
        });
    });
});

module.exports = router;
