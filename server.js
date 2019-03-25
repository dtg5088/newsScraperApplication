// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");
//var mongoose = require("mongoose");

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

// Database configuration
var databaseUrl = "newsArticles";
var collections = ["articles"];

// Hook mongojs config to db variable
var db = mongojs(databaseUrl, collections);

// Log any mongojs errors to console
db.on("error", function(error) {
  console.log("Database Error:", error);
});

  // Retrieve data from the db
  app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.articles.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });
  
  // Scrape data from one site and place it into the mongodb db
  app.get("/scrape", function(req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://www.bizjournals.com/washington/news/commercial-real-estate/construction").then(function(response) {
      //attemps to catch articles
      var results = [];
      var i = 25;
    // Load the html body from axios into cheerio
      var $ = cheerio.load(response.data);
      // For each element with a "title" class
      $("a.item--flag").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        var link = $(element).attr("href");
        var title = $(element).children().find("h3").text();
        var image = $(element).children().find("img").attr("src");
        var date = $(element).children().find("time").text().trim();
  
        // If this found element had both a title and a link
        if (true) {
          // Save these results in an object that we'll push into the results array we defined earlier
            results.push({
              title: title,
              link: link,
              image: image,
              date: date
            });
  
  
    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
  
  
          //Insert the data in the scrapedData db
          db.articles.insert({
            title: title,
            link: link,
            image: image,
            date: date
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          });
        }
      });
    });
  
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
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
app.listen(3000, function() {
  console.log("App running on port 3000");
});

module.exports = app;
