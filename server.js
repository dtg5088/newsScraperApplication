// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Require all models
var db = require("./models");

var PORT = 3000;
     
var app = express();

// Set the app up with morgan.
// morgan is used to log our HTTP Requests. By setting morgan to 'dev'
// the :status token will be colored red for server error codes,
// yellow for client error codes, cyan for redirection codes,
// and uncolored for all other codes.
//app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost:27017/newsArticles", { useNewUrlParser: true });

  
  // Scrape data from one site and place it into the mongodb db
  app.get("/scrape", function(req, res) {

    // // Delete all results from the scrapedData collection in the db
    // db.Article.remove({})
    //   .then(function(dbArticle) {
    //   // If we were able to successfully find Articles, send them back to the client
    //   res.json(dbArticle);
    // })
    // .catch(function(err) {
    //   // If an error occurred, send it to the client
    //   res.json(err);
    // });

    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://www.bizjournals.com/washington/news/commercial-real-estate/construction").then(function(response) {
      
      var i = 25;
    // Load the html body from axios into cheerio
      var $ = cheerio.load(response.data);
      // For each element with a "title" class
      $("a.item--flag").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        //attemps to catch articles
        var results = {};
        
        results.link = $(this).attr("href");
        var pglink = $(this).attr("href");
        results.title = $(this).children().find("h3").text();
        results.image = $(this).children().find("img").attr("src");
        results.date = $(this).children().find("time").text().trim();

        axios.get("https://www.bizjournals.com/"+pglink).then(function(response) {
          
          $("p").each(function(i, element) {
          results.paragragh = $(this).children().find(".content_segment").text();
          console.log(results.paragraph);
          })
        })
        .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
  
        console.log(results);
        
          // Create a new Article using the `result` object built from scraping
        db.Article.create(results)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
      });
    });
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
  });


  // Route for getting all Articles from the db
app.get("/articles", function(req, res) {

  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
  
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
//  // Routes
// require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000");
});

module.exports = app;
