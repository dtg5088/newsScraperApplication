

// Grab the articles as a json
$.getJSON("/articles", function(data) {
    
  // For each one
  for (var i = 0; i < data.length; i++) {
    var $div = $("<div>");
    $div.addClass("row");

    // Display the apropos information on the page
    $div.append("<img class='col artImage' data-id='" + data[i]._id + "' src='" + data[i].image + "'style='float: left;'><br /><p class='timeAndDate'>" + data[i].date +"</p></p></div>");
    $div.append("<div class='col-xs-12 col-sm-8 col-md-9' data-id='" + data[i]._id + "'style='float: left; display: inline-block'><p>" + data[i].title + "<br /><a href='https://www.bizjournals.com/" + data[i].link +"'>"+"Link to Article"+"</a></p><br></div>");
    $div.append("<hr>");
    $("#articles").append($div);
  }
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",     
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

   



    











// // Loads results onto the page
// function getResults() {
//     // Empty any results currently on the page
//     $("#results").empty();
//     // Grab all of the current notes
//     $.getJSON("/all", function(data) {
//       // For each note...
//       for (var i = 0; i < data.length; i++) {
//         // ...populate #results with a p-tag that includes the note's title and object id
//         $("#results").prepend("<p class='data-entry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" +
//           data[i]._id + ">" + data[i].title + "</span><span class=delete>X</span></p>");
//       }
//     });
//   }