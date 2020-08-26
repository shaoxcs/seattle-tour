const express = require("express");
const router  = express.Router();
const Campground = require("../models/campgrounds");
const middleware = require("../middleware");
const Review = require("../models/review");
const Comment = require("../models/comment");

//INDEX - show all campgrounds
// router.get("/", (req, res) => {
//   // Get all campgrounds from DB
//   Campground.find({}, (err, allCampgrounds) => {
//     if(err){
//       console.log(err);
//     } else {
//       res.render("campgrounds/index",
//         {
//           campgrounds: allCampgrounds,
//           currentUser: req.user
//         }
//       );
//     }
//   });
// });

router.get("/", (req, res) => {
  var perPage = 8;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  Campground.find({}).skip((perPage * pageNumber) - perPage)
  .limit(perPage).exec((err, allCampgrounds) => {
      Campground.count().exec((err, count) => {
          if (err) {
              console.log(err);
          } else {
              res.render("campgrounds/index", {
                  campgrounds: allCampgrounds,
                  current: pageNumber,
                  pages: Math.ceil(count / perPage)
              });
          }
      });
  });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn,(req, res) => {
  // get data from form and add to campgrounds array
  var newCampground = {
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    description: req.body.description,
    author: {
      id: req.user._id,
      username: req.user.username
    }
  }
  // Create a new campground and save to DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if(err){
      console.log(err);
    } else {
      //redirect back to campgrounds page
      res.redirect("/campgrounds");
    }
  });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
// router.get("/:id", (req, res) => {
//   Campground.findById(req.params.id)
//   .populate("comments")
//   .exec((err, foundCampground) => {
//     if(err){
//       console.log(err);
//     } else {
//       res.render("campgrounds/show", {campground: foundCampground});
//     }
//   });
// });

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
  //find the campground with provided ID
  Campground.findById(req.params.id).populate("comments").populate({
      path: "reviews",
      options: {sort: {createdAt: -1}}
  }).exec(function (err, foundCampground) {
      if (err) {
          console.log(err);
      } else {
          //render show template with that campground
          res.render("campgrounds/show", {campground: foundCampground});
      }
  });
});

// EDIT Campground Route
router.get("/:id/edit", middleware.checkCampOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, found) => {
      res.render("campgrounds/edit", {campground: found});
  });
});

// UPDATE Campground Route
router.put("/:id", middleware.checkCampOwnership, (req, res) => {
  // find and update -> redirect
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// DESTROY Campground Route
// router.delete("/:id", middleware.checkCampOwnership, (req, res) => {
//   Campground.findByIdAndRemove(req.params.id, (err) => {
//     if (err) {
//       res.redirect("/campgrounds");
//     } else {
//       res.redirect("/campgrounds");
//     }
//   })
// });

router.delete("/:id", middleware.checkCampOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
      if (err) {
          res.redirect("/campgrounds");
      } else {
          // deletes all comments associated with the campground
          Comment.remove({"_id": {$in: campground.comments}}, function (err) {
              if (err) {
                  console.log(err);
                  return res.redirect("/campgrounds");
              }
              // deletes all reviews associated with the campground
              Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                  if (err) {
                      console.log(err);
                      return res.redirect("/campgrounds");
                  }
                  //  delete the campground
                  campground.remove();
                  req.flash("success", "Campground deleted successfully!");
                  res.redirect("/campgrounds");
              });
          });
      }
  });
});

module.exports = router;
