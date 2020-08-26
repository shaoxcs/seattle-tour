const express = require("express");
const router  = express.Router({mergeParams: true});
const Campground = require("../models/campgrounds");
const Comment = require("../models/comment");
const middleware = require("../middleware");


// COMMENT ROUTES
router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: campground});
    }
  });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
  // lookup camp by id
  Campground.findById(req.params.id, (err, camp) => {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          req.flash("error", "Something went wrong");
          console.log(err);
        } else {
          // add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save comment
          comment.save()
          camp.comments.push(comment);
          camp.save();
          req.flash("success", "Successfully added a comment");
          res.redirect("/campgrounds/" + camp._id);
        }
      });
    }
  });
});

// EDIT Comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
  Comment.findById(req.params.comment_id, (err, found) => {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        campground_id: req.params.id,
        comment: found
      });
    }
  });
});

// UPDATE Comment
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  // find and update -> redirect
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// DESTROY Comment Route
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "Comment deleted");
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
});

module.exports = router;
