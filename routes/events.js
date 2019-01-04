"use strict";

const express = require('express');
const router  = express.Router();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

let totalInfo = {};
let counter = 0;
let theURL = '';
let userResponse = [];
let eventURL = '';
let templateVarsDB = {};
let templateVars = {'eventInfo': '', 'attendeeInfo': '', 'timeslotInfo': '', 'theAvailability': [] , 'updateTimes': ''};

module.exports = function (DataHelpers) {

  //organizer will be redirected after input personal information and description of event
  let totalGuests = {};
  router.get("/", (req, res) =>{
    console.log("Hello there!");
  });

  // store secretURL  to be reused later
  router.put("/create", (req, res) => {
    if (counter === 0 && totalInfo.hasOwnProperty('organizers')) {
      eventURL = req.body.secretURL
      totalInfo.theEventInfo["secretURL"] = req.body.secretURL;
      DataHelpers.createEvent(totalInfo.organizers.mail, totalInfo.organizers.name, totalInfo.theEventInfo.title, totalInfo.theEventInfo.description, totalInfo.theEventInfo.location, eventURL);
      counter++;
    }
  })

  //store event, host information.
  router.post("/create", (req, res) => {
    const organizer = {name: req.body.theHostName, mail: req.body.theHostEmail }
    const eventInfo = {title: req.body.theEventName, location: req.body.theEventLocation, description: req.body.theEventDescription};
    const att = {name: req.body.attendeeName, mail: req.body.attendeeMail};
    totalInfo = {organizers: organizer, theEventInfo: eventInfo, eventSchedules: req.body.eventTimes.slice(1)};
    let tempArray = totalInfo.eventSchedules;
    let sortedArr = [];
    let theScheduleData = {};
    tempArray.forEach(function(item) {
      if (item != '') {
        sortedArr.push((new Date(item)));
      }
    })
    sortedArr.sort((a, b) => a - b)
    totalInfo.eventSchedules = sortedArr;
    for (let i = 0; i < totalInfo.eventSchedules.length; i++) {
      userResponse.push(false);
    }
    //create organizer here
    counter = 0;
    DataHelpers.doesOrganizerExist(organizer.mail, organizer.name);
    res.render("invite", totalInfo);
  });

  // redirect to the invite page and store event times.
  router.get("/invite", (req, res) => {
    let theScheduleData = {};
    if (totalInfo){
      let sortedArr = totalInfo.eventSchedules;
      for (let i = 0; i < sortedArr.length; i++){
        theScheduleData[i] = sortedArr[i].toISOString().split('T')[0] + ' ' + sortedArr[i].toISOString().split('T')[1].slice(0, 5);
      }
    } else if (templateVarsDB[theURL]) {
      let sortedArr = templateVarsDB[theURL].timeslotInfo.time;
      for (let i = 0; i < sortedArr.length; i++) {
        theScheduleData[i] = sortedArr[i].toISOString().split('T')[0] + ' ' + sortedArr[i].toISOString().split('T')[1].slice(0, 5);
      }
    }
    res.json(theScheduleData);
  })

  // store guest names and mails and redirect to event page.
  router.post("/invite", (req, res) => {

    const secretURL = eventURL;
    for (let time of totalInfo.eventSchedules) {
      time = time.toISOString().split('T')[0] + ' ' + time.toISOString().split('T')[1].slice(0, 5);
      DataHelpers.createTimeslot(eventURL, time);
    };
    res.redirect(`/api/events/${eventURL}`);
  })

  // redirect to the page with the unique URL
  router.get("/:id", (req, res) => {
    let dateSelection = {};
    theURL = req.params.id;
    //show event info on page:
    if (!templateVarsDB.hasOwnProperty(theURL)) {
      let templateVars = {'eventInfo': '', 'attendeeInfo': '', 'timeslotInfo': '', 'theAvailability': [] , 'updateTimes': ''};
      templateVarsDB[theURL] = templateVars;
    }
    Promise.resolve(DataHelpers.findEventByURL(theURL))
    .then((event) => {
      DataHelpers.joinOrganizer(theURL)

      .then((organizer) => {
        templateVarsDB[theURL].eventInfo = {
          title: event.name,
          description: event.description,
          location: event.location,
          organizerName: organizer
        };
        const templateVars = templateVarsDB[theURL];
        return templateVars;
      })
      .then((templateVars) => {
        DataHelpers.findTimeslots(theURL)
        .then((timeslots) => {
          templateVars.timeslotInfo = {
            time: timeslots.times.sort((a, b) => a - b)
          };
          return templateVars;
        })
        .then((templateVars) => {
          DataHelpers.findGuestLists(theURL)
          .then((guestList) => {
            let i = 0;
            let guestArr = [];
            for (let guest of guestList) {
              guestArr.push(guest);
              i++;
            }
            let theScheduleData = {};
            let timeArr = totalInfo.eventSchedules;
            for (let i = 0; i < timeArr.length; i++) {
              if (userResponse[i] === true) {
                theScheduleData[timeArr[i]] = true;
              }
              else {
               theScheduleData[timeArr[i]] = false;
              }
            }
            res.render("event_show", { templateVars, guestArr });
          })
        })
      })
    })
  })

  //update the page after the client select availability.
  router.put("/:id", (req, res) => {
    let urlString = theURL.toString();

    Promise.resolve(DataHelpers.findEventByURL(theURL))
      .then((event) => {
        DataHelpers.joinOrganizer(theURL)

        .then((organizer) => {

          templateVarsDB[theURL].eventInfo = {
            title: event.name,
            description: event.description,
            location: event.location,
            organizerName: organizer
          };
          const templateVars = templateVarsDB[theURL];
          return templateVars;
        })
        .then((templateVars) => {
          DataHelpers.findTimeslots(theURL)
          .then((timeslots) => {
            templateVars.timeslotInfo = {
              time: timeslots.times.sort((a, b) => a -b)
            };
            return templateVars;
          })
          .then((templateVars) => {
            DataHelpers.findGuestLists(theURL)
            .then((guestList) => {
              let i = 0;
              let guestArr = [];
              for (let guest of guestList) {
                guestArr.push(guest);
                i++;
              }
              return guestArr;
            })
            .then((guestArr) => {
              DataHelpers.doesAttendeeExist(req.body.attMail, req.body.attName)
              .then((attendeeID) => {
                for (let i = 0; i < req.body.attTimes.length; i++) {
                  if (req.body.attTimes[i] === 'true') {
                    DataHelpers.createGuestList(attendeeID, urlString, templateVars.timeslotInfo.time[i])
                  } else if (req.body.attTimes[i] === 'false') {
                    DataHelpers.deleteGuestList(attendeeID, urlString, templateVars.timeslotInfo.time[i])
                  }
                }

              res.render("event_show", { templateVars, guestArr });
              })
            })
          })
        })
    })
  })


  return router;
}
