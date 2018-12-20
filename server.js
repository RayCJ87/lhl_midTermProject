"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const pg          = require("pg");
const settings = require("./settings");
// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

// Setup postgreSQL database
const client = new pg.Client({
  user     : settings.user,
  password : settings.password,
  database : settings.database,
  host     : settings.hostname,
  port     : settings.port,
  ssl      : settings.ssl
});

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

//// Connect to the database
// client.connect((err) => {
//   if (err) {
//     return console.log("Connection Error", err);
//   }

// }



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

//generate a new random string
function generateRandomString() {
  const randomKey = "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0pQAZWSXEDCRFVTGBYHNUJMIKOLP";
  let output= "";
  while (output.length < 6){
    var tempNum = Math.floor(Math.random() * (randomKey.length));
    output+= randomKey[tempNum];
  }
  return output;
}

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

//organizer will be redirected after input personal information and description of event
app.post("/", (req, res) => {
  res.redirect("/createEvent");
});

//organizer inputs attendee information and create event
app.get("/createEvent", (req, res) => {
  res.render("invite");
})

//organizer will be redirected to an event page after an event is created
app.post("/createEvent", (req, res) => {
  res.redirect("/viewEvent");
})

//read the event page
app.get("/viewEvent", (req, res) => {
  res.render("eventResponseForm");
})


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
