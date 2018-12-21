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

const DataHelpers = require("./dataHelper.js")(knex);
// Seperated Routes for each Resource
const eventsRoutes = require("./routes/events")(DataHelpers);
const organizer = require('./lib/organizer')(knex);

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

let timeSlotCount = [];


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
app.use("/api/events", eventsRoutes);

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
  // const getNewEventURL = generateRandomString();

  res.render("invite");
})

//organizer will be redirected to an event page after an event is created
app.post("/createEvent", (req, res) => {
  res.redirect("/testEvent");
})

//read the event page
app.get("/testEvent", (req, res) => {
  res.render("event_show");
})

app.post("/testEvent", (req, res) => {

})

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
