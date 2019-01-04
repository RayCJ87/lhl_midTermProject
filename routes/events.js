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
let templateVars = {'eventInfo': '', 'attendeeInfo': [], 'timeslotInfo': '', 'theAvailability': [] , 'updateTimes': ''};

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

    const secretURL = eventURL;
    console.log("About to knex.");
    for (let time of virtualDB[eventURL].eventSchedules) {
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
      let templateVars = {'eventInfo': '', 'attendeeInfo': [], 'timeslotInfo': '', 'theAvailability': [] , 'updateTimes': ''};
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
        console.log("The template Var 1st get: ", templateVars)
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
          .then((guests) => {

            for (let guest of guests) {
              templateVars.attendeeInfo.push(guest);
            }
            DataHelpers.findUpdateTimesByURL(theURL)
            .then((theTimes) => {
              let dynamicAvailability = [];
              console.log("The updateTimes from DB: ", theTimes);
              console.log("The templateVars for handling:  ", templateVars)
              if (templateVars["updateTimes"] == '' ) {
                console.log("times length: ", theTimes.length);
                console.log("weird place: ", templateVars);
                for (let i = 0; i < theTimes.length; i++) {
                  if (i == 0){
                    templateVars["updateTimes"] = {};
                  }
                  if (!templateVars.updateTimes.hasOwnProperty(theTimes[i].startTime))
                    templateVars.updateTimes[theTimes[i].startTime] = [];
                  }
                console.log("weird place2 : ", templateVars);
                for (let i = 0; i < theTimes.length; i++) {
                  console.log(theTimes[i].name)
                  console.log(typeof theTimes[i].name);
                  if (theTimes[i].name.length >0 ){
                    console.log("now:  ",templateVars.updateTimes[theTimes[i].startTime]);
                      if (!templateVars.updateTimes[theTimes[i].startTime].includes(theTimes[i].name))
                          templateVars.updateTimes[theTimes[i].startTime].push(theTimes[i].name);
                      }
              }
                // console.log("Thetimes . startTime is ====> ", templateVars.updateTimes[theTimes[i]])

              }
              console.log("The updateTimes 2nd stage: ", templateVars.updateTimes)
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
              console.log('templateVars: ', templateVars);
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
            .then((guests) => {

              for (let guest of guests) {
                templateVars.attendeeInfo.push(guest);
              }
              /* creat a loop that add guestlists to each timeslot and return a new object which will be rendered
              to the event_show file.*/
              let attGuestList = [];
              let dynamicAvailability = [];
              let uniqueAttendee = `${req.body.attName}(${req.body.attMail})`;

              //Update templateVars.updateTimes where data is stored at the back end.
              if (templateVars["updateTimes"] == '') {
                  templateVars["updateTimes"] = {};
                  console.log("Here: ", templateVars);
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
                console.log("Y or N:   ", req.body.attTimes);
                console.log("Here there: ", templateVars);
                let middle = {}
                for (let k = 0; k < templateVars.timeslotInfo.time.length; k++) {
                  middle[templateVars.timeslotInfo.time[k]] = req.body.attTimes[k];
                }

                for(let k in middle){
                  if(templateVars["updateTimes"][k].length != 0 && middle[k] === "false"){
                      console.log("Ready----> delete", k);
                      DataHelpers.deleteGuestInUpdateTimes(theURL, k, uniqueAttendee);
                  }
                }

                console.log("A temp variable for use: ", middle);
                for (let i = 0; i < req.body.attTimes.length; i++) {
                  console.log("THe length: ", templateVars["updateTimes"][templateVars.timeslotInfo.time[i]]);
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
              for (let i in templateVars.updateTimes){

                if (templateVars.updateTimes[i].length > 0){
                  for (let j = 0; j < templateVars.updateTimes[i].length; j++){
                    // console.log("createUpdateTimes", theDate)
                    if (!templateVars.updateTimes[i].hasOwnProperty(uniqueAttendee)){
                      console.log("createUpdateTimes", i, templateVars.updateTimes[i])
                      DataHelpers.createUpdateTimes(theURL, i, templateVars.updateTimes[i][j]);
                      console.log(" succeed now!");
                    }
                  }
                }
                else{
                  DataHelpers.createUpdateTimes(theURL, i, '');
                }
              }
              //the Availability shows the availability that's been shown on the web
              templateVars.theAvailability = dynamicAvailability;
              console.log('templateVars: ', templateVars);
              res.render("event_show", templateVars);
            })
          })
        })
    })
  })
  return router;
}
