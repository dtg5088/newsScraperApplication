//var db = require("../models");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function(app) {
  // Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  app.db.articles.find({}, function(error, found) {
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
        app.db.articles.insert({
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

}
