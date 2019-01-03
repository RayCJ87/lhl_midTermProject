"use strict";

const express = require('express');
const router  = express.Router();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

let totalInfo = {};
let templateVars = {'eventInfo': '', 'attendeeInfo': '', 'timeslotInfo': '', 'theAvailability': [] , 'updateTimes': ''};
let counter = 0;
let theURL = '';
let userResponse = [];

module.exports = function (DataHelpers) {

  //organizer will be redirected after input personal information and description of event
  let totalGuests = {};
  router.get("/", (req, res) =>{
    console.log("Hello there!");
  });

  // store secretURL  to be reused later
  router.put("/create", (req, res) => {
    console.log("the URL from backend: ", req.body.secretURL);
    totalInfo.theEventInfo["secretURL"] = req.body.secretURL;
    if (counter === 0) {
      DataHelpers.createEvent(totalInfo.organizers.mail, totalInfo.organizers.name, totalInfo.theEventInfo.title, totalInfo.theEventInfo.description, totalInfo.theEventInfo.location, totalInfo.theEventInfo.secretURL);
      counter++;
    }
  })

  //store event, host information.
  router.post("/create", (req, res) => {
    const organizer = {name: req.body.theHostName, mail: req.body.theHostEmail }
    const eventInfo = {title: req.body.theEventName,location: req.body.theEventLocation, description: req.body.theEventDescription};
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
    console.log("The temp array is: ", sortedArr);
    totalInfo.eventSchedules = sortedArr;
    for (let i = 0; i < totalInfo.eventSchedules.length; i++) {
      userResponse.push(false);
    }
    //create organizer here
    counter = 0;
    DataHelpers.doesOrganizerExist(organizer.mail, organizer.name);
    res.render("invite");
  });

  // redirect to the invite page and store event times.
  router.get("/invite", (req, res) => {
    let theScheduleData = {};
    let sortedArr = totalInfo.eventSchedules;
    for (let i = 0; i < sortedArr.length; i++){
      theScheduleData[i] = sortedArr[i].toISOString().split('T')[0] + sortedArr[i].toISOString().split('T')[1].slice(0, 5);
    }
    res.json(theScheduleData);
  })

  // store guest names and mails and redirect to event page.
  router.post("/invite", (req, res) => {

    const secretURL = totalInfo.theEventInfo.secretURL;
    theURL = totalInfo.theEventInfo.secretURL.toString();
    console.log("Ultimate data: ", totalInfo);
    console.log("About to knex.");
    for (let time of totalInfo.eventSchedules) {
      console.log("THe url for timeslots: ", totalInfo.theEventInfo.secretURL);
      console.log("The time for timeslots: ", time);
      DataHelpers.createTimeslot(totalInfo.theEventInfo.secretURL, time)
    };
    console.log("Event created!");
    res.redirect(`/api/events/${secretURL}`);
  })

  // redirect to the page with the unique URL
  router.get("/:id", (req, res) => {
    let tempArray = totalInfo.eventSchedules;
    let dateSelection = {};
    let secretURL = req.params.id;

    //show event info on page:
    Promise.resolve(DataHelpers.findEventByURL(theURL))
    .then((event) => {
      DataHelpers.joinOrganizer(theURL)
      .then((organizer) => {
        templateVars.eventInfo = {
          title: event.name,
          description: event.description,
          location: event.location,
          organizerName: organizer
        };
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
            if (guestList === false) {
              templateVars.attendeeInfo = '';
            } else {
              templateVars.attendeeInfo = {
                name: guestList[0].name,
                email: guestList[0].email,
                availability: guestList[0].availability
              };
            }
            console.log('templateVars: ', templateVars);
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

            console.log("The updates to show on the page: ", theScheduleData);
            res.render("event_show", templateVars);
          })
        })
      })
    })
  })

  //update the page after the client select availability.
  router.put("/:id", (req, res) => {
    console.log("the urls: ", theURL);
    DataHelpers.doesAttendeeExist(req.body.attMail, req.body.attName);
    console.log("attendee created!");

    Promise.resolve(DataHelpers.findEventByURL(theURL))
      .then((event) => {
        DataHelpers.joinOrganizer(theURL)
        .then((organizer) => {
          templateVars.eventInfo = {
            title: event.name,
            description: event.description,
            location: event.location,
            organizerName: organizer
          };
          return templateVars;
        })
        .then((templateVars) => {
          DataHelpers.findTimeslots(theURL)
          .then((timeslots) => {
            // console.log('timeslots: ', timeslots)
            templateVars.timeslotInfo = {
              time: timeslots.times.sort((a, b) => a -b)
            };
            return templateVars;
          })
          .then((templateVars) => {
            DataHelpers.findGuestLists(theURL)
            .then((guestList) => {
              // console.log('guestList: ', guestList)
              if (guestList === false) {
                templateVars.attendeeInfo = '';
              } else {
                templateVars.attendeeInfo = {
                  name: guestList[0].name,
                  email: guestList[0].email,
                  availability: guestList[0].availability
                };
              }
              /* creat a loop that add guestlists to each timeslot and return a new object which will be rendered
              to the event_show file.*/
              let attGuestList = [];
              let dynamicAvailability = [];
              let uniqueAttendee = `${req.body.attName}(${req.body.attMail})`;
              console.log("updateTimes now: ", templateVars.updateTimes);

              //Update templateVars.updateTimes where data is stored at the back end.
              if (templateVars["updateTimes"] == '') {
                // console.log("make a new updateTimes");
                  templateVars["updateTimes"] = {};
                  for (let i = 0; i < req.body.attTimes.length; i++) {
                    templateVars["updateTimes"][templateVars.timeslotInfo.time[i]] = [];
                    if (req.body.attTimes[i] == 'true' ) {
                      userResponse[i] = true;
                      templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].push(uniqueAttendee);
                      attGuestList.push(uniqueAttendee);
                    }
                    else{
                      userResponse[i] = false;
                    }
                  }
                  for (let j in templateVars.updateTimes){
                    let element = `${j}`;
                    for (let i = 0; i < templateVars.updateTimes[j].length; i++) {
                        if (i === 0){
                          element+= `: ${templateVars.updateTimes[j][i]} `;
                        }
                        else {
                          element+= `, ${templateVars.updateTimes[j][i]} `;
                        }
                    }
                    dynamicAvailability.push(element);
                  }
              }
              else {
                for (let i = 0; i < req.body.attTimes.length; i++) {
                  if (templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].length != 0 && req.body.attTimes[i] == 'false') {
                    if ((templateVars["updateTimes"][templateVars.timeslotInfo.time[i]]).includes(uniqueAttendee)){
                      let deleteGuest = (templateVars["updateTimes"][templateVars.timeslotInfo.time[i]]).indexOf(uniqueAttendee);
                      (templateVars["updateTimes"][templateVars.timeslotInfo.time[i]]).splice(deleteGuest, 1);
                    }
                  } else{
                    if (req.body.attTimes[i] == 'true' && !templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].includes(uniqueAttendee)){
                      userResponse[i] = true;
                      templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].push(uniqueAttendee);
                      attGuestList.push(uniqueAttendee);
                    }
                  }
                }
                for (let j in templateVars.updateTimes){
                  let element = `${j}  `;
                  for (let i = 0; i < templateVars.updateTimes[j].length; i++) {
                    if (i === 0){
                      element+= `: ${templateVars.updateTimes[j][i]} `;
                    }
                    else {
                      element+= `, ${templateVars.updateTimes[j][i]} `;
                    }
                  }
                  dynamicAvailability.push(element);
                }
              }
              //the Availability shows the availability that's been shown on the web
              templateVars.theAvailability = dynamicAvailability;
              console.log("the availability: ", dynamicAvailability);
              // console.log("attGuestList = ", attGuestList);
              console.log("Update times: ", templateVars.updateTimes);
              console.log('templateVars: ', templateVars);
              res.render("event_show", templateVars);
            })
          })
        })
    })
  })


  return router;
}
