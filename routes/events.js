"use strict";

const express = require('express');
const router  = express.Router();

module.exports = function (DataHelpers) {

    // function createTimeSlot(newTime){
    //     timeSlotCount.push(newTime);
    // return timeSlotCount;
    // }

  //organizer will be redirected after input personal information and description of event
   router.post("/create", (req, res) => {

    const organizer = {name: req.body.theHostName, mail: req.body.theHostMail }
    const eventInfo = {title: req.body.theEventName, description: req.body.theEventDescription};
    console.log("the time is: ", req.body.eventTime);
    const totalInfo = {organizers: organizer, theEventInfo: eventInfo};
    console.log("the big time: ", );
    console.log(totalInfo);

    //
    //let people = ['geddy', 'neil', 'alex'];
    // res.render("invite", {people: people});
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

    const attendee = {name: req.body.attendeeName, email: req.body.attendeeMail}
    res.render("event_show");
    // res.redirect("/testEvent");
  })

  //read the event page
  // router.get("/api/events/testEvent", (req, res) => {
  //   res.render("event_show");
  // })

  router.post("/api/events/testEvent", (req, res) => {

})



  return router;
}
