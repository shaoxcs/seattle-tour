var mongoose    = require("mongoose"),
    Campground  = require("./models/campgrounds"),
    Comment     = require("./models/comment");

var seeds = [
  { name: "Seattle view 1",
    image: "https://images.unsplash.com/photo-1516905365385-7f89706faaf8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2734&q=80",
    description: "This is another view at seattle"
  },
  { name: "Seattle view 2",
    image: "https://images.unsplash.com/photo-1565622688489-55e36a5690ae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
    description: "This is another view at seattle"
  },
  { name: "Seattle view 3",
    image: "https://images.unsplash.com/photo-1542223616-740d5dff7f56?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2836&q=80",
    description: "This is another view at seattle"
  }
];

async function seedDB() {
  try{
    // Removes all campgrounds
    await Comment.remove({});
    await Campground.remove({});

    for (const seed of seeds) {
      let campground = await Campground.create(seed);
      let comment = await Comment.create(
        {
          text: "This place is great, but I wish there was internet",
          author: "Homer"
        }
      );
      campground.comments.push(comment);
      campground.save();
    }
  } catch(err) {
    console.log(err);
  }
}

module.exports = seedDB;
