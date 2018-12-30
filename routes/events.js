"use strict";

const express = require('express');
const router  = express.Router();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

let totalInfo = {};
let templateVars = {'eventInfo': '', 'attendeeInfo': '', 'timeslotInfo': ''};


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
    const organizer = {name: req.body.theHostName, mail: req.body.theHostEmail }
    const eventInfo = {title: req.body.theEventName,location: req.body.theEventLocation, description: req.body.theEventDescription};
    const att = {name: req.body.attendeeName, mail: req.body.attendeeMail};
    totalInfo = {organizers: organizer, theEventInfo: eventInfo, eventSchedules: req.body.eventTimes.slice(1)};

    //create organizer here
    DataHelpers.doesOrganizerExist(organizer.mail, organizer.name);


    // DataHelpers.createOrganizer;

    // knex("organizers").insert({
    //   name: organizer.name,
    //   email: organizer.mail
    // })
    // .then(function(){
    //   console.log("successfully added an organizer.")
    //   knex.select().from('organizers')
    //     .then(function(organizers) {
    //       console.log("done!");
    //       req.send(organizers);
    //     })
    // })

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
    console.log("the URL from backend: ", req.body.secretURL);
    totalInfo.theEventInfo["secretURL"] = req.body.secretURL
    console.log("Real schedules: ",  theScheduleData);
    console.log("Schedule data loded!");
    res.json(theScheduleData);
  })

  // store guest names and mails and redirect to event page.
  router.post("/invite", (req, res) => {
    // totalInfo['guests'] = req.body.guestNames;
    // totalInfo['guestsContact'] = req.body.guestMails;
    const secretURL = totalInfo.theEventInfo.secretURL;

    console.log("Ultimate data: ", totalInfo);
    console.log("About to knex.");

    //Create the event here
    DataHelpers.createEvent(totalInfo.organizers.mail, totalInfo.organizers.name, totalInfo.theEventInfo.title, totalInfo.theEventInfo.description, totalInfo.theEventInfo.location, secretURL);
    console.log("Event created!");

    res.redirect(`/api/events/${secretURL}`);

  })
  // redirect to the page with the unique URL
  router.get("/:id", (req, res) => {
    let tempArray = totalInfo.eventSchedules;
    let theScheduleData = {};
    // const theURL = totalInfo.theEventInfo.secretURL.toString();
    // for (let i = 0; i < tempArray.length; i++){
    //   console.log("The time of the event: ", tempArray[i]);
    //   theScheduleData[i] = tempArray[i];
    //   // DataHelpers.createTimeslot(theURL, tempArray[i].toString());
    // }
    let secretURL = req.params.id;
    // console.log("timeslots added!")
    //show event info on page:
    Promise.resolve(DataHelpers.findEventByURL('a1b2c3d4e5f6g7h8i9j0'))
    .then((event) => {
      DataHelpers.joinOrganizer('a1b2c3d4e5f6g7h8i9j0')
      .then((organizer) => {
        templateVars.eventInfo = {
          title: event.name,
          description: event.description,
          location: event.location,
          organizerName: organizer
        }
        console.log('templateVars: ', templateVars);
        res.render("event_show", templateVars);
      })
    })
  })

  //update the page after the client select availability.
  router.put("/:id", (req, res) => {
    console.log("New guest name: ", req.body.attName);
    console.log("New guest mail: ", req.body.attMail);
    DataHelpers.doesAttendeeExist(req.body.attMail, req.body.attName)
    console.log("attendee created!")
    .then(() => {
      DataHelpers.findGuestLists('a1b2c3d4e5f6g7h8i9j0')
            .then((guestList) => {
              console.log('guestList: ', guestList)
              if (guestList) {
                templateVars.attendeeInfo = {
                  name: guestList[0].name,
                  email: guestList[0].email,
                  availability: guestList[0].availability
                }
              } else {
                templateVars.attendeeInfo = '';
              }
            })
    })
    res.render("event_show");
  })

// DataHelpers.haveRSVP('a1b2c3d4e5f6g7h8i9j0', 'peter@example.com');
// DataHelpers.showRSVP('a1b2c3d4e5f6g7h8i9j0', 'peter@example.com');
// DataHelpers.doesAttendeeExist('mycapeiscoolerthanyours@example.com', 'Stephen Strange');
// DataHelpers.findAttendeeGuestLists('a1b2c3d4e5f6g7h8i9j0', 'west@example.com');
// DataHelpers.findGuestLists('a1b2c3d4e5f6g7h8i9j0');
// DataHelpers.createTimeslot('a1b2c3d4e5f6g7h8i9j0', '2018-12-31T9:00');
DataHelpers.findEventByURL('a1b2c3d4e5f6g7h8i9j0');

  // DataHelpers.createTimeslot('8RQ154', '2018-12-30T17:50');
  return router;
}
