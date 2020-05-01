var mongoose = require('mongoose');

var commentsSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        avatar: { type: String, default: "https://www.ibts.org/wp-content/uploads/2017/08/iStock-476085198.jpg" }
    },
    createdAt: { type: Date, default: Date.now }
});

var Comment = mongoose.model('Comment', commentsSchema);
module.exports = Comment;

