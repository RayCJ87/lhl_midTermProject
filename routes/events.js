"use strict";

const express = require('express');
const router  = express.Router();
let totalInfo = {};


const organizerHelper = require('../lib/organizer');


module.exports = function (DataHelpers) {

  //organizer will be redirected after input personal information and description of event
    let totalGuests = {};
    let eventTime = {};
    router.post("/", (req, res) =>{
      console.log("hello");

    // res.redirect("/index");
    });

   // router.get("/create", (req, res) => {
   //  res.render("invite");

   // });
   router.post("/create", (req, res) => {
    const organizer = {name: req.body.theHostName, mail: req.body.theHostMail }
    const eventInfo = {title: req.body.theEventName,location: req.body.theEventLocation, description: req.body.theEventDescription};

    const att = {name: req.body.attendeeName, mail: req.body.attendeeMail};
    totalInfo = {organizers: organizer, theEventInfo: eventInfo, eventSchedules: req.body.eventTimes};
    console.log(totalInfo);
    console.log(req.body);
    res.render("invite");
    // res.redirect("/invite");
  });

  //organizer inputs attendee information and create event
  // router.get("/invite", (req, res) => {
  //   // const getNewEventURL = generateRandomString();

  //   res.render("invite");
  // })

  //organizer will be redirected to an event page after an event is created
  router.post("/invite", (req, res) => {

    totalInfo['guests'] = req.body.guestLists;
    console.log(totalInfo);
    console.log(req.body);
    // const attendee = {name: req.body.attendeeName, email: req.body.attendeeMail}
    // totalInfo['attendee'] = attendee;
    res.render("event_show");
    // res.redirect("/testEvent");
  })

  router.put("/invite", (req, res) => {

  })

  return router;
}
