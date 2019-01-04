"use strict";

module.exports = function MakeDataHelpers(knex) {

//-------------------------------------------------------------
//CALLBACKS:
//-------------------------------------------------------------

  //ADDS A NEW ORGANIZER - CB OF doesOrganizerExist
  const createOrganizer = (email, name) => {
    return new Promise((resolve) => {
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
          resolve(organizerID);
        })
      })
    });
  };

  //FINDS ORGANIZER BY EMAIL TO PREVENT DUPLICATE ORGANIZERS - CB OF createEvent
  const doesOrganizerExist = (email, name) => {
    return new Promise ((resolve) => {
      knex('organizers')
      .select('id')
      .where({email: email})
      .then((rows) => {
        if (rows.length >= 1) {
          let organizerID = rows[0].id
          resolve(organizerID);
        } else if (rows.length < 1) {
          resolve(createOrganizer(email, name));
        }
      })
    });
  };

  //ADDS A NEW ATTENDEE FROM RSVP FORM - CB OF doesAttendeeExist
  const createAttendee = (attendeeEmail, attendeeName) => {
    return new Promise((resolve) => {
      knex('attendees').insert({
        name: attendeeName,
        email: attendeeEmail
      })
      .then(() => {
        knex('attendees')
        .select('id')
        .where({email: attendeeEmail})
        .then((rows) => {
          let attendeeID = rows[0].id;
          resolve(attendeeID);
        })
      })
    })
  };

  //FINDS ATTENDEE BY EMAIL TO PREVENT DUPLICATE ATTENDEES
  const doesAttendeeExist = (attendeeEmail, attendeeName) => {
    return new Promise ((resolve) => {
      knex('attendees')
      .select('id')
      .where({email: attendeeEmail})
      .then((rows) => {
        if (rows.length >= 1) {
          let attendeeID = rows[0].id
          resolve(attendeeID);
        } else {
          resolve(createAttendee(attendeeEmail, attendeeName));
        }
      })
    });
  };

  //RETURNS EVENT ROW FROM DB BY URL TO DISPLAY ON EVENT PAGE
  const findEventByURL = (url) => {
    return new Promise((resolve, reject) => {
      knex('events')
      .select('*')
      .where({url: url})
      .then((rows) => {
        let event = rows[0]
        if (event) {
          resolve(event);
        }
        else {
          reject('404 Page Not Found');
        }
      })
      .catch((error) => reject(error));
    });
  };

  const findEventIDByURL = (url) => {
    return new Promise((resolve) => {
      knex('events')
      .select('*')
      .where({url: url})
      .then((rows) => {
        let eventID = rows[0].id
        resolve(eventID);
      })
    });
  };

  const findTimeslotID = (url, time) => {
    return new Promise((resolve) => {
      findEventIDByURL(url)
      .then((eventID) => {
        knex('timeslots')
        .select('id')
        .where({event_id: eventID})
        .andWhere({start_time: time})
        .then((rows) => {
          let timeslotID = rows[0].id
          resolve(timeslotID);
        })
      })
    });
  };

  const findAttendeeIDByEmail = (attendeeEmail) => {
    return (
      knex('attendees')
      .select('id')
      .where({email: attendeeEmail})
      .then((rows) => {
        let attendeeID = rows[0].id
        return attendeeID;
      })
      );
  };

    //CHECKS IF ATTENDEE HAS RSVP'D AND RETURNS TRUE OR FALSE
    const haveRSVP = (url, email) => {
      return new Promise((resolve) => {
        findEventIDByURL(url)
        .then((eventID) => {
          knex('attendees')
          .join('guest_lists', 'attendees.id', '=', 'guest_lists.attendee_id')
          .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
          .select('attendees.id')
          .where({email: email})
          .andWhere({event_id: eventID})
          .groupBy('attendees.id')
          .then((rows) => {
            let rsvp = rows[0];
            if (rsvp) {
              let hasRSVP = true;
              resolve(hasRSVP);
            } else {
              let hasRSVP = false;
              resolve(hasRSVP);
            }
          })
        })
      })
    };


//-------------------------------------------------------------
//RETURNED FUNCTIONS:
//-------------------------------------------------------------

  return {

    doesOrganizerExist: doesOrganizerExist,
    doesAttendeeExist: doesAttendeeExist,
    findEventByURL: findEventByURL,
    findTimeslotID: findTimeslotID,
    findAttendeeIDByEmail: findAttendeeIDByEmail,

    //SAVES WEBSITE INPUT IN SERVER MEMORY
    saveActivityInfo: function(info, callback) {
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

    //RETURNS ORGANIZER OF EVENT TO DISPLAY ON EVENT PAGE
    joinOrganizer: (url) => {
      return new Promise((resolve) => {
        knex('events')
        .join('organizers', 'events.organizer_id', '=', 'organizers.id')
        .select('organizers.name')
        .where({url: url})
        .then((rows) => {
          let organizer = rows[0].name;
          resolve(organizer);
        })
      });
    },

    //ADDS EVENT TO DB, ADDS ORGANIZER IF NEW
    createEvent: (email, organizerName, eventName, description, location, secretURL) => {
      doesOrganizerExist(email, organizerName)
      .then((organizerID) => {
        knex('organizers')
        .select('id')
        .where({id: organizerID})
        .then((rows) => {
          let organizerID = rows[0].id;
          return organizerID;
        })
        .then((organizerID) => {
          return knex('events').insert({
            url: secretURL,
            name: eventName,
            description: description,
            location: location,
            organizer_id: organizerID
          });
        })
      })
    },

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
      return new Promise((resolve) => {
        findEventIDByURL(url)
        .then((eventID) => {
          knex('timeslots')
          .join('events', 'timeslots.event_id', '=', 'events.id')
          .select(
              knex.raw('ARRAY_AGG(timeslots.start_time) as times')
            )
          .where({event_id: eventID})
          .then((arr) => {
            let timeslots = arr[0];
            resolve(timeslots);
          })
        })

      })
    },

    // PULLS ALL GUEST_LISTS NAMES, EMAILS, AND TIMES FOR AN EVENT FROM DB
    findGuestLists: (url) => {
      return new Promise((resolve, reject) => {
        findEventIDByURL(url)
        .then((eventID) => {
          knex('guest_lists')
          .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
          .join('attendees', 'guest_lists.attendee_id', '=', 'attendees.id')
          .select([
            'attendees.name',
            'attendees.email',
            knex.raw('array_agg(timeslots.start_time) as times')
            ])
          .where({event_id: eventID})
          .groupBy('attendees.email', 'attendees.name')
          .then((guestList) => {
            resolve(guestList);
          })
        })
      });
    },

  //LINKS ATTENDEE TO TIMESLOT WHEN TIME IS CHECKED
  createGuestList: (attendeeID, url, time) => {
    findTimeslotID(url, time)
    .then((timeslotID) => {
      knex('guest_lists')
      .join('attendees', 'attendees.id', '=', 'guest_lists.attendee_id')
      .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
      .select([
        'attendee_id',
        'timeslot_id'
        ])
      .where({attendee_id: attendeeID})
      .andWhere({timeslot_id: timeslotID})
      .then((rows) => {
        if (rows.length < 1) {
          return knex('guest_lists').insert({
            attendee_id: attendeeID,
            timeslot_id: timeslotID
          })
        }
      })
    })
  },

  //DELETES LINK BETWEEN ATTENDEE AND TIMESLOT WHEN TIME IS UNCHECKED
  deleteGuestList: (attendeeID, url, time) => {
    findTimeslotID(url, time)
    .then((timeslotID) => {
      return (
        knex('guest_lists')
        .join('attendees', 'attendees.id', '=', 'guest_lists.attendee_id')
        .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
        .where({attendee_id: attendeeID})
        .andWhere({timeslot_id: timeslotID})
        .del()
      )
    })
  },

    //PULLS ALL GUEST_LISTS FOR A SPECIFIC ATTENDEE AND EVENT
    findAttendeeGuestLists: (url, attendeeEmail) => {
      return new Promise((resolve) => {
        findAttendeeIDByEmail(attendeeEmail)
        .then((attendeeID) => {
          knex('attendees')
          .join('guest_lists', 'attendees.id', '=', 'guest_lists.attendee_id')
          .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
          .select([
            'attendees.name',
            'attendees.email',
            knex.raw('ARRAY_AGG(timeslots.start_time) as availability')
            ])
          .where({attendee_id: attendeeID})
          .groupBy('attendees.email', 'attendees.name')
          .then((availability) => {
            resolve(availability);
          })
        })
      })
    }


  }
}
