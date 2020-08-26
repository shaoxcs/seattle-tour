const express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash        = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campgrounds"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");

const commentRoutes     = require("./routes/comments"),
      reviewRoutes      = require("./routes/reviews"),
      campgroundRoutes  = require("./routes/campgrounds"),
      indexRoutes       = require("./routes/index");

// App config
// mongoose.connect("mongodb://localhost/yelp_camp", {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
//   useFindAndModify: true,
// });

mongoose.connect("mongodb+srv://user_shao:123@cluster0-hteq5.mongodb.net/test?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: true,
  useCreateIndex: true
}).then(() => {
  console.log("connected to DB");
}).catch(err => {
  console.log(err.message);
});

// mongodb+srv://user_shao:123@cluster0-hteq5.mongodb.net/test?retryWrites=true&w=majority

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seed the database

// Passport configuration
app.use(require("express-session")({
  secret: "Shao is the best guy!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.err = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

var port = process.env.PORT || 3000;
app.listen(port, process.env.IP, () => {
  console.log("The Yelp Camp server starts");
});