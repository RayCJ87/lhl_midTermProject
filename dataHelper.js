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
      .then((email) => {
        knex('organizers')
        .select('*')
        .where({email: email})
        .then((rows) => {
          let organizer = rows[0]
          return organizer
        })
      })
    )
  };

  //FINDS ORGANIZER BY EMAIL TO PREVENT DUPLICATE ORGANIZERS
  const doesEmailExist = (email, name) => {
    return (
      knex('organizers')
      .select('*')
      .where({email: email})
      .then((rows) => {
        if (rows.length >= 1) {
          let organizer = rows[0]
          return organizer
        } else {
          return createOrganizer(email, name)
        }
      })
    )
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


//-------------------------------------------------------------
//RETURNED FUNCTIONS:
//-------------------------------------------------------------

  return {

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

    //RETURNS EVENT ROW FROM DB BY URL TO DISPLAY ON EVENT PAGE
    findEventByURL: (url) => {
      return new Promise((resolve, reject) => {
        knex('events')
        .select('*')
        .where({url: url})
        .limit(1)
        .then((rows) => {
          let event = rows[0]
          if (event) {
            return resolve(event)
          }
          else {
            return reject()
          }
        })
        .catch((error) => reject(error));
      })
    },

    //RETURNS ORGANIZER OF EVENT TO DISPLAY ON EVENT PAGE
    joinOrganizer: (url) => {
      return new Promise((resolve) => {
        knex('events')
        .join('organizers', 'events.organizer_id', '=', 'organizers.id')
        .select('organizers.name')
        .where({url: url})
        .then((rows) => {
          let organizer = rows[0]
          return resolve(organizer);
        })
      })
    },

    //ADDS EVENT TO DB
    createEvent: (email, organizerName, eventName, description, location) => {
      return (
        doesEmailExist(email, organizerName)
        .then((organizer) => {
          return organizer.id;
        })
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
      );
    }


  }
}
