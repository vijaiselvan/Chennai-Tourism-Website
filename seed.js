var mongoose = require('mongoose'),
    Area = require('./models/chennai'),
    Comment = require('./models/comment.js')

var data = [
    {
        name: "Cloud's Rest",
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Desert Mesa",
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Canyon Floor",
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
]


function seedDB() {
    Area.deleteMany({}, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Removed Campgrounds");
            Comment.deleteMany({}, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Comments are removed");
                }
            });
        }
        data.forEach(function (seed) {
            Area.create(seed, function (err, area) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Added a campground");
                    Comment.create({
                        text: "This is great place to visit during summer holidays",
                        author: "vijay"
                    }, function (err, comment) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            area.comments.push(comment);
                            area.save();
                            console.log("created comment")
                        }
                    })
                }
            })
        })
    })
}

module.exports = seedDB;