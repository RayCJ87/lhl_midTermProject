"use strict";

const express = require('express');
const router  = express.Router();
let totalInfo = {};


module.exports = function (DataHelpers) {

  //organizer will be redirected after input personal information and description of event
  let totalGuests = {};
  router.get("/", (req, res) =>{
    console.log("Hello there!");
    // res.render("index");
  });

  // store secretURL  to be reused later
  router.put("/create", (req, res) => {
    console.log("the URL from backend: ", req.body.secretURL);
    totalInfo.theEventInfo["secretURL"] = req.body.secretURL;
  })

  //store event, host information.
  router.post("/create", (req, res) => {
    const organizer = {name: req.body.theHostName, mail: req.body.theHostMail }
    const eventInfo = {title: req.body.theEventName,location: req.body.theEventLocation, description: req.body.theEventDescription};
    const att = {name: req.body.attendeeName, mail: req.body.attendeeMail};
    totalInfo = {organizers: organizer, theEventInfo: eventInfo, eventSchedules: req.body.eventTimes.slice(1)};
    console.log("The super data is: ", totalInfo);
    console.log(req.body);
    res.render("invite");

  });

  // redirect to the invite page and store event times.
  router.get("/invite", (req, res) => {
    let tempArray = totalInfo.eventSchedules;
    let theScheduleData = {};
    for (let i = 0; i < tempArray.length; i++){
      theScheduleData[i] = tempArray[i];
    }
    console.log("Real schedules: ",  theScheduleData);
    console.log("Schedule data loded!");
    res.json(theScheduleData);
  })

  // store guest names and mails and redirect to event page.
  router.post("/invite", (req, res) => {
    totalInfo['guests'] = req.body.guestNames;
    totalInfo['guestsContact'] = req.body.guestMails;
    const secretURL = totalInfo.theEventInfo.secretURL;
    console.log("Ultimate data: ", totalInfo);
    res.redirect(`/api/events/${secretURL}`);

  })

  // redirect to the page with the unique URL
  router.get("/:id", (req, res) => {
    let tempArray = totalInfo.eventSchedules;
    let theScheduleData = {};
    for (let i = 1; i < tempArray.length; i++){
      theScheduleData[i] = tempArray[i];
    }
    console.log("Data shown!");
    let secretURL = req.params.id;
    res.render("event_show", {secretURL: secretURL});
  })

  //update the page after the client select availability.
  router.put("/:id", (req, res) => {
    res.render("event_show");
  })



  return router;
}
