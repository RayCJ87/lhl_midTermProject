"use strict";

module.exports = function MakeDataHelpers(knex) {

//-------------------------------------------------------------
//CALLBACKS:
//-------------------------------------------------------------

  //ADDS A NEW ORGANIZER
  const createOrganizer = (email, name) => {
    return (
      knex('organizers').insert({
      name: name,
      email: email
      })
      .then(() => {
        knex('organizers')
        .select('id')
        .where({email: email})
        .then((rows) => {
          let organizerID = rows[0].id;
          return organizerID
        })
      })
    )
  };

  //FINDS ORGANIZER BY EMAIL TO PREVENT DUPLICATE ORGANIZERS
  const doesOrganizerExist = (email, name) => {
    return new Promise ((resolve) => {
      knex('organizers')
      .select('id')
      .where({email: email})
      .then((rows) => {
        if (rows.length >= 1) {
          let organizerID = rows[0].id
          resolve(organizerID);
        } else if (!rows) {
          return createOrganizer(email, name);
        }
      })
      .then((organizerID) => {
        console.log(organizerID);
      })
    });
  };

  //GENERATES RANDOM STRING FOR EVENT URL
  const generateURL = (num) => {
    let alphaNumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < num; i++) {
      randomString += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length));
    }
    return randomString;
  };

  //RETURNS EVENT ROW FROM DB BY URL TO DISPLAY ON EVENT PAGE
  const findEventByURL = (url) => {
      return new Promise((resolve, reject) => {
        knex('events')
        .select('*')
        .where({url: url})
        .limit(1)
        .then((rows) => {
          let event = rows[0]
          if (event) {
            return event;
          }
          else {
            return reject('404 Page Not Found');
          }
        })
        .catch((error) => reject(error));
      });
  }

  const findEventIDByURL = (url) => {
      return new Promise((resolve) => {
        knex('events')
        .select('*')
        .where({url: url})
        .limit(1)
        .then((rows) => {
          let eventID = rows[0].id
            resolve(eventID);
        })
      });
  }

  //guest enters email on event page
    //is guest in system - yes, email
    //is guest linked to event: event, attendee.id, guest_list

    //CHECKS IF ATTENDEE HAS RSVP'D AND RETURNS TRUE OR FALSE
    const haveRSVP = (url, email) => {
      return new Promise((resolve) => {
        findEventIDByURL(url)
        .then((eventID) => {
          knex('attendees')
          .join('guest_lists', 'attendees.id', '=', 'guest_lists.attendee_id')
          .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
          // .join('events', 'timeslots.event_id', '=', 'events.id')
          .select('attendees.id')
          .where({email: email})
          .andWhere({event_id: eventID})
          .groupBy('attendees.id')
          // .andWhere({attendee_id: attendees.id})
          .then((rows) => {
            let rsvp = rows[0];
            if (rsvp) {
              let hasRSVP = true;
              resolve(hasRSVP);
              // console.log('rsvp: ', rsvp)
            } else {
              let hasRSVP = false;
              resolve(hasRSVP);
              // console.log('no rsvp')
            }
          })
        })
      })
    }



//-------------------------------------------------------------
//RETURNED FUNCTIONS:
//-------------------------------------------------------------

  return {

    doesOrganizerExist: doesOrganizerExist,
    findEventByURL: findEventByURL,

    //SAVES WEBSITE INPUT IN SERVER MEMORY
    saveActivityInfo: function(info, callback) {
      // console.log(1)
      for (let i of info){
        if (i === "organizer"){
          knex("organizer").insert(knex.info.i);
        }
        else if (i === "events"){
          knex("events").insert(knex.info.i);
        }
        else if (i === "timeslot"){
          knex("timeslot").insert(knex.info.i);
        }
        else if (i === "attendee"){
            knex("attendee").insert(knex.info.i);
        }
      }
      callback(null, true);
    },

    //RETURNS ORGANIZER ROW FROM DB BY ID
    //** commented out because we may not need this **
    // findOrganizerByID: (id) => {
    //   return new Promise((resolve, reject) => {
    //     knex('organizers')
    //     .select('*')
    //     .where({id: id})
    //     .limit(1)
    //     .then((rows) => {
    //       let organizer = rows[0]
    //       if (organizer) {
    //         return resolve(organizer)
    //       }
    //       else {
    //         return reject()
    //       }
    //     })
    //     .catch((error) => reject(error));
    //   })
    // },

    //RETURNS EVENT ROW FROM DB BY ID
    //** commented out because we may not need this **
    // findEventByID: (id) => {
    //   return new Promise((resolve, reject) => {
    //     knex('events')
    //     .select('*')
    //     .where({id: id})
    //     .limit(1)
    //     .then((rows) => {
    //       let event = rows[0]
    //       if (event) {
    //         return resolve(event)
    //       }
    //       else {
    //         return reject()
    //       }
    //     })
    //     .catch((error) => reject(error));
    //   })
    // },


    //RETURNS ORGANIZER OF EVENT TO DISPLAY ON EVENT PAGE
    joinOrganizer: (url) => {
      return new Promise((resolve) => {
        knex('events')
        .join('organizers', 'events.organizer_id', '=', 'organizers.id')
        .select('organizers.name')
        .where({url: url})
        .then((rows) => {
          let organizer = rows[0]
          resolve(organizer);
        })
      })
    },

    //ADDS EVENT TO DB
    createEvent: (email, organizerName, eventName, description, location) => {
        // let organizerID = doesEmailExist(email, organizerName)
        doesOrganizerExist(email, organizerName)
        // .then((organizerID) => {
            // return console.log('got organizerID ', organizerID);
          // return organizerID
        // })
        .then((organizerID) => {
          knex('organizers')
          .select('id')
          .where({id: organizerID})
          .then((rows) => {
            let organizerID = rows[0]
            return organizerID
          })
          .then((organizerID) => {
            const url = generateURL(45)
            return url
          })
          .then((url) => {
            return knex('events').insert({
              url: url,
              name: eventName,
              description: description,
              location: location,
              organizer_id: organizerID
            })
          })
        })
    },

    //ADDS A NEW TIMESLOT TO DB
    //***let me know if we need a function to
    //***check if timeslot already exists
    createTimeslot: (url, startTime) => {
      findEventIDByURL(url)
      .then((eventID) => {
        return knex('timeslots').insert({
          start_time: startTime,
          event_id: eventID
        })
      })
    },

    //PULLS ALL TIMESLOTS DATA FOR AN EVENT FROM DB
    findTimeslots: (url) => {
      findEventByURL(url)
        .then((eventID) => {
          let query = knex('timeslots');
          query = query.join('events', 'timeslots.event_id', '=', 'events.id');
          query = query.select('*');
          query = query.where({event_id: eventID});
          query.then(timeslots => {
            return timeslots;
          })
        })
    },


    //ADDS A NEW ATTENDEE FROM RSVP FORM
    //***let me know if you need to check if attendee already exists
    //***when you call this function. I will move some things around.
    createAttendee: (url, attendeeName, attendeeEmail) => {
      haveRSVP(url, attendeeEmail)
      .then((hasRSVP) => {
        if (hasRSVP === false) {
          return knex('attendees').insert({
            name: attendeeName,
            email: attendeeEmail
          })
        }
      })
    },

    //LINKS ATTENDEE TO SELECTED TIMESLOTS
    // createGuestList

    // PULLS ALL GUEST_LISTS NAMES AND TIMES FOR AN EVENT FROM DB
    //***will show multiple names for guests with multiple time slots selected;
    //***not sure if I can fix this here or if it should be fixed in the function in routes
    //***group by???***
    findGuestLists: (url) => {
      findEventIDByURL(url)
      .then((eventID) => {
        knex('guest_lists')
        .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
        .join('attendees', 'guest_lists.attendee_id', '=', 'attendees.id')
        .select('attendees.name', 'attendees.email', 'timeslots.start_time')
        .where({event_id: eventID})
        .then((guestList) => {
          return guestList;
        })
      })

    }


  }
}
