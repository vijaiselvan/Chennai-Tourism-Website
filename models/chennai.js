mongoose = require('mongoose');

// Schema Setup 
var chennaiSchema = new mongoose.Schema({
    name: String,
    location: String,
    image: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

var Area = mongoose.model("Area", chennaiSchema);
module.exports = Area;