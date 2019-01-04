"use strict";

const express = require('express');
const router  = express.Router();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

let totalInfo = {};
let counter = 0;
let theURL = '';
let virtualDB = {};
let eventURL = '';
let templateVarsDB = {};
let templateVars = {'eventInfo': '', 'timeslotInfo': '', 'theAvailability': [] , 'updateTimes': ''};

module.exports = function (DataHelpers) {

  //organizer will be redirected after input personal information and description of event
  let totalGuests = {};
  router.get("/", (req, res) =>{
  });

  // store secretURL  to be reused later
  router.put("/create", (req, res) => {
    if (counter === 0 && totalInfo.hasOwnProperty('organizers')) {
      eventURL = req.body.secretURL
      virtualDB[eventURL] = totalInfo;
      DataHelpers.createEvent(virtualDB[eventURL].organizers.mail, virtualDB[eventURL].organizers.name, virtualDB[eventURL].theEventInfo.title, virtualDB[eventURL].theEventInfo.description, virtualDB[eventURL].theEventInfo.location, eventURL);
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
    totalInfo.eventSchedules = sortedArr;
    for (let i = 0; i < totalInfo.eventSchedules.length; i++) {
    }
    //create organizer here
    counter = 0;
    DataHelpers.doesOrganizerExist(organizer.mail, organizer.name);
    res.render("invite", eventInfo);
  });


  // redirect to the invite page and store event times.
  router.get("/invite", (req, res) => {
    let theScheduleData = {};
    if (virtualDB[theURL]) {
      let sortedArr = virtualDB[theURL].eventSchedules;
      for (let i = 0; i < sortedArr.length; i++){
        theScheduleData[i] = sortedArr[i].toISOString().split('T')[0] + sortedArr[i].toISOString().split('T')[1].slice(0, 5);
      }
    }
    else if (templateVarsDB[theURL]) {
      let sortedArr = templateVarsDB[theURL].timeslotInfo.time;
      for (let i = 0; i < sortedArr.length; i++){
        theScheduleData[i] = sortedArr[i].toISOString().split('T')[0] + sortedArr[i].toISOString().split('T')[1].slice(0, 5);
      }
    }

    res.json(theScheduleData);
  })


  // store guest names and mails and redirect to event page.
  router.post("/invite", (req, res) => {
    for (let time of virtualDB[eventURL].eventSchedules) {
      DataHelpers.createTimeslot(eventURL, time)
    };
    res.redirect(`/api/events/${eventURL}`);
  })


  // redirect to the page with the unique URL
  router.get("/:id", (req, res) => {
    theURL = req.params.id;

    //show event info on page:
    if (!templateVarsDB.hasOwnProperty(theURL)) {
      let templateVars = {'eventInfo': '', 'timeslotInfo': '', 'theAvailability': [] , 'updateTimes': ''};
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
            time: timeslots.times.sort((a, b) => a -b)
          };
          return templateVars;
        })
        .then((templateVars) => {
          DataHelpers.findGuestLists(theURL)
          .then(() => {
            DataHelpers.findUpdateTimesByURL(theURL)
            .then((theTimes) => {
              let dynamicAvailability = [];
              if (templateVars["updateTimes"] == '' ) {
                for (let i = 0; i < theTimes.length; i++) {
                  if (i === 0){
                    templateVars["updateTimes"] = {};
                  }
                  if (!templateVars.updateTimes.hasOwnProperty(theTimes[i].startTime)){
                    templateVars.updateTimes[theTimes[i].startTime] = [];
                  }
                }
                for (let i = 0; i < theTimes.length; i++) {
                  if (theTimes[i].name.length >0 && !templateVars.updateTimes[theTimes[i].startTime].includes(theTimes[i].name)){
                          templateVars.updateTimes[theTimes[i].startTime].push(theTimes[i].name);
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
              templateVars.theAvailability = dynamicAvailability;
              res.render("event_show", templateVars);
            })
          })
        })
      })
    })
  })


  //update the page after the client select availability.
  router.put("/:id", (req, res) => {
    DataHelpers.doesAttendeeExist(req.body.attMail, req.body.attName);
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
            .then(() => {
              /* creat a loop that add guestlists to each timeslot and return a new object which will be rendered
              to the event_show file.*/
              let dynamicAvailability = [];
              let uniqueAttendee = `${req.body.attName}(${req.body.attMail})`;

              //Update templateVars.updateTimes where data is stored at the back end.
              if (templateVars["updateTimes"] == '') {
                  templateVars["updateTimes"] = {};
                  for (let i = 0; i < req.body.attTimes.length; i++) {
                    templateVars["updateTimes"][templateVars.timeslotInfo.time[i]] = [];
                    if (req.body.attTimes[i] == 'true' ) {
                      templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].push(uniqueAttendee);
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
                //make a temporary variable use later.
                let middle = {}
                for (let k = 0; k < templateVars.timeslotInfo.time.length; k++) {
                  middle[templateVars.timeslotInfo.time[k]] = req.body.attTimes[k];
                }
                for(let k in middle){
                  if(templateVars["updateTimes"][k].length != 0 && middle[k] === "false"){
                      DataHelpers.deleteGuestInUpdateTimes(theURL, k, uniqueAttendee);
                  }
                }
                for (let i = 0; i < req.body.attTimes.length; i++) {
                  if (templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].length != 0 && req.body.attTimes[i] == 'false') {
                    if ((templateVars["updateTimes"][templateVars.timeslotInfo.time[i]]).includes(uniqueAttendee)){
                      let deleteGuest = (templateVars["updateTimes"][templateVars.timeslotInfo.time[i]]).indexOf(uniqueAttendee);
                      (templateVars["updateTimes"][templateVars.timeslotInfo.time[i]]).splice(deleteGuest, 1);
                    }
                  } else{
                    if (req.body.attTimes[i] == 'true' && !templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].includes(uniqueAttendee)){
                      templateVars["updateTimes"][templateVars.timeslotInfo.time[i]].push(uniqueAttendee);
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
              for (let i in templateVars.updateTimes){
                if (templateVars.updateTimes[i].length > 0){
                  for (let j = 0; j < templateVars.updateTimes[i].length; j++){
                    if (!templateVars.updateTimes[i].hasOwnProperty(uniqueAttendee)){
                      DataHelpers.createUpdateTimes(theURL, i, templateVars.updateTimes[i][j]);
                    }
                  }
                }
                else{
                  DataHelpers.createUpdateTimes(theURL, i, '');
                }
              }
              //the Availability shows the availability that's been shown on the web
              templateVars.theAvailability = dynamicAvailability;
              res.render("event_show", templateVars);
            })
          })
        })
    })
  })
  return router;
}
