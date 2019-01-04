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
let virtualDB = {};
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
      virtualDB[eventURL] = totalInfo;
      DataHelpers.createEvent(virtualDB[eventURL].organizers.mail, virtualDB[eventURL].organizers.name, virtualDB[eventURL].theEventInfo.title, virtualDB[eventURL].theEventInfo.description, virtualDB[eventURL].theEventInfo.location, eventURL);
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
    // res.render("invite", eventInfo);
    res.render("invite");
  });

  // redirect to the invite page and store event times.
  router.get("/invite", (req, res) => {
    let theScheduleData = {};
    if (virtualDB[theURL]){
        let sortedArr = virtualDB[theURL].eventSchedules;
        for (let i = 0; i < sortedArr.length; i++){
          theScheduleData[i] = sortedArr[i].toISOString().split('T')[0] + ' ' + sortedArr[i].toISOString().split('T')[1].slice(0, 5);
        }
      }
    res.json(theScheduleData);
  })

  // store guest names and mails and redirect to event page.
  router.post("/invite", (req, res) => {

    const secretURL = eventURL;
    console.log("About to knex.");
    for (let time of virtualDB[eventURL].eventSchedules) {
      let yymmdd = time.toISOString().split('T')[0];
      let hhmm = time.toISOString().split('T')[1].slice(0, 5);
      time = yymmdd + " " + hhmm;
      DataHelpers.createTimeslot(eventURL, time)
    };
    console.log("Event created!");
    res.redirect(`/api/events/${eventURL}`);
  })

  // redirect to the page with the unique URL
  router.get("/:id", (req, res) => {
    let dateSelection = {};
    theURL = req.params.id;
    console.log("about to knex here!!")
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
        console.log("The templateVarsDB here -->", templateVarsDB);
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
            console.log('guestArr: ', guestArr);
            console.log('templateVars at GET :id: ', templateVars);
            let theScheduleData = {};
            let timeArr = virtualDB[theURL].eventSchedules;
            for (let i = 0; i < timeArr.length; i++) {
              if (userResponse[i] === true) {
                theScheduleData[timeArr[i]] = true;
              }
              else {
               theScheduleData[timeArr[i]] = false;
              }
            }
            console.log("The virtualDB at Get bottom: ", virtualDB[theURL])
            console.log("The updates to show on the page: ", theScheduleData);
            res.render("event_show", { templateVars, guestArr });
          })
        })
      })
    })
  })

  //update the page after the client select availability.
  router.put("/:id", (req, res) => {
    console.log("the urls: ", theURL);
    console.log('req.body: ', req.body);
    DataHelpers.doesAttendeeExist(req.body.attMail, req.body.attName)
    // .then((attendeeID) => {
    //   for (let i = 0; i < req.body.attTimes.length; i++) {
    //     if (req.body.attTimes === 'true') {
    //       dataHelpers.createGuestList(attendeeID, theURL, templateVars.timeslotInfo.time[i])
    //     } else {
    //       dataHelpers.deleteGuestList(attendeeID, theURL, templateVars.timeslotInfo.time[i])
    //     }
    //   }
    // })

// =======

    console.log("attendee created!");
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
              console.log('guestArr: ', guestArr);
              console.log('templateVars at PUT :id: ', templateVars);
              /* creat a loop that add guestlists to each timeslot and return a new object which will be rendered
              to the event_show file.*/
              let attGuestList = [];
              let dynamicAvailability = [];
              let uniqueAttendee = `${req.body.attName}(${req.body.attMail})`;

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
              res.render("event_show", { templateVars, guestArr });
            })
          })
        })
    })
  })

// DataHelpers.haveRSVP('a1b2c3d4e5f6g7h8i9j0', 'peter@example.com');
// DataHelpers.showRSVP('a1b2c3d4e5f6g7h8i9j0', 'peter@example.com');
// DataHelpers.doesAttendeeExist('mycapeiscoolerthanyours@example.com', 'Stephen Strange');
// DataHelpers.findAttendeeGuestLists('a1b2c3d4e5f6g7h8i9j0', 'west@example.com');
// DataHelpers.findGuestLists('a1b2c3d4e5f6g7h8i9j0');
// DataHelpers.createTimeslot('a1b2c3d4e5f6g7h8i9j0', '2018-12-31T9:00');
// DataHelpers.findEventByURL('a1b2c3d4e5f6g7h8i9j0');
// DataHelpers.createTimeslot('8RQ154', '2018-12-30T17:50');
// DataHelpers.findTimeslots('a1b2c3d4e5f6g7h8i9j0');
// DataHelpers.deleteGuestList(1, 'IblNiA', '2019-01-04 22:22');

  return router;
}
