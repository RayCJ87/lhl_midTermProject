"use strict";

module.exports = function MakeDataHelpers(knex) {

//-------------------------------------------------------------
//CALLBACKS:
//-------------------------------------------------------------

  //ADDS A NEW ORGANIZER
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
        } else if (rows.length < 1) {
          resolve(createOrganizer(email, name));
        }
      })
    });
  };

  //ADDS A NEW ATTENDEE FROM RSVP FORM
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
              // console.log('rsvp: ', rsvp)
            } else {
              let hasRSVP = false;
              resolve(hasRSVP);
              // console.log('no rsvp')
            }
          })
        })
      })
    };

    const showGuestLists = (guestList) => {
      console.log('showGuestLists guestList: ', guestList);

      class Guest {

        constructor(attendeeName, attendeeEmail) {
          this.guestName = attendeeName;
          this.guestEmail = attendeeEmail;
          this.availability = [];
        }

        // addAvailability(array_agg) {
        //   array_agg.sort((a, b) => a - b);
        //   for (let time of array_agg) {
        //     this.availability.push(time);
        //   }
        // }

      }
      const guests = [];
      for (let guest of guestList) {
        guest = new Guest(guest.name, guest.email);
        console.log('array_agg as timeSelection: ', guest.timeSelection);
        // guest.availability = guest.array_agg;
        guests.push(guest);
      }
      console.log('guests: ', guests);
      return guests;
      // if (guestList.length >= 1) {
      //   console.log('function orig guestList: ', guestList)
      //   let names = [];
      //   let emails = [];
      //   let availabilities = [];
      //   for (let guest of guestList) {
      //     names.push(guest.name);
      //     emails.push(guest.email);
      //     availabilities.push(guest.timeSelection);
      //     //get value of timeSelection [array] [array]
      //   };
      //   guestList = {
      //     name: names,
      //     email: emails,
      //     availability: availabilities
      //   };
      //   console.log('function guestList: ', guestList)
      //   resolve(guestList);
      // } else {
      //   guestList = [ { 'name': '', 'email': '', 'availability': '' } ];
      //   resolve(guestList);
      // }
    }

    //SHOWS ALL TIMESLOTS THAT AN ATTENDEE HAS SELECTED FOR A SPECIFIC EVENT
    // const showRSVP = (url, email) => {
    //   return new Promise((resolve) => {
    //     findEventIDByURL(url)
    //     .then((eventID) => {
    //       knex('attendees')
    //       .join('guest_lists', 'attendees.id', '=', 'guest_lists.attendee_id')
    //       .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
    //       .select('timeslots.start_time')
    //       .where({email: email})
    //       .andWhere({event_id: eventID})
    //       .then((rows) => {
    //         if (rows[0]) {
    //           let rsvp = rows;
    //           // console.log('rsvp: ', rsvp)
    //           resolve(rsvp);
    //         } else {
    //           let rsvp = false;
    //           // console.log('no rsvp')
    //           resolve(rsvp);
    //         }
    //       })
    //     })
    //   })
    // };



//-------------------------------------------------------------
//RETURNED FUNCTIONS:
//-------------------------------------------------------------

  return {

    doesOrganizerExist: doesOrganizerExist,
    doesAttendeeExist: doesAttendeeExist,
    findEventByURL: findEventByURL,
    findAttendeeIDByEmail: findAttendeeIDByEmail,
    showGuestLists: showGuestLists,
    // showRSVP: showRSVP,

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

    //ADDS EVENT TO DB
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
            knex.raw('to_json(array_agg((timeslots.start_time))) as times')
            ])
          .where({event_id: eventID})
          .groupBy('attendees.email', 'attendees.name')
          .then((guestList) => {
            console.log('guestList: ', guestList);
            class Guest {

              constructor(attendeeName, attendeeEmail) {
                this.guestName = attendeeName;
                this.guestEmail = attendeeEmail;
                this.availability = [];
              }

              // addAvailability(times) {
                // times = times.toString;
                // times.sort((a, b) => a - b);
                // console.log('times: ', times);
                // for (let time of times) {
                  // this.availability.push(time);
                // }
              // }

            }
            const guests = [];
            for (let guest of guestList) {
              guest = new Guest(guest.name, guest.email);
              // guest.times = guest.times;
              console.log('typeof times: ', guest.times);
              guests.push(guest);
            }
            console.log('guests: ', guests);
            resolve(guests);
            // resolve(showGuestLists(guestList));
          })
        })
      });
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
