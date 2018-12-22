module.exports = function(knex) {


  //FINDS ATTENDEE BY EMAIL
  function findByEmail(email) {
    return new Promise((resolve, reject) => {
      knex('attendees')
      .select('*')
      .where({email: email})
      .limit(1)
      .then((rows) => {
        attendee = rows[0]
        return resolve(attendee)
      })
      .catch((error) => reject(error));
    });
  }

  //CHECKS IF ATTENDEE EMAIL IS UNIQUE
  function doesEmailExist(email) {
    return new Promise((resolve) => {
      findByEmail(email)
      .then((attendee) => {
        if (!attendee) {
          return resolve(email);
        }
      })
    });
  }

  //ADD ATTENDEE TO DATABASE
  function addAttendee(name, email) {
    return (
      doesEmailExist(email)
      .then((email) => {
        return name;
      })
      .then((name) => {
        return knex('attendees').insert({
          name: name,
          email: email
        })
      })
    );
  }

  //JOINS ATTENDEES TO TIMESLOTS - GUEST_LISTS
  function guestList(url) {
    return new Promise((resolve) => {
      knex('attendees')
      .join('guest_lists', 'attendees.id', '=', 'guest_lists.attendees_id')
      .join('timeslots', 'guest_lists.timeslot_id', '=', 'timeslots.id')
      .join('events', 'timeslots.event_id', '=', 'events.id')
      .select('attendees.name', 'timeslots.start_time')
      .where({events.url: url})
      .then((rows) => {
        guestList = rows[0]
        return resolve(guestList);
      })
    })
  }

  return {
    doesEmailExist: doesEmailExist,
    addAttendee: addAttendee,
    guestList: guestList
  };
}
