var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Area = require('./models/chennai'),
  Comment = require('./models/comment'),
  seedDB = require('./seed'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  User = require('./models/user'),
  methodOverride = require('method-override'),
  flash = require('connect-flash');
require('dotenv').config();

app.use(methodOverride('_method'));
app.locals.moment = require('moment');

var areaRoutes = require('./routes/areas'),
  commentRoutes = require('./routes/comments'),
  indexRoutes = require('./routes/index');

//seed the database
// seedDB();
var url = process.env.MONGO_ATLAS;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('Connected to DB');
}).catch(err => {
  console.log('ERROR:', err.message);
})

// mongoose.connect('mongodb://localhost/chennaiv5', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(flash());


//PASSPORT configuration
app.use(require('express-session')({
  secret: 'session',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
})

app.use('/area', areaRoutes);
app.use('/area/:id/comments', commentRoutes);
app.use(indexRoutes);


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Chennai sever has started');
});
