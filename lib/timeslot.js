module.exports = function(knex) {

//RETURNS EVENT ID
  function joinEvent(url) {
    return new Promise((resolve, reject) => {
      knex('timeslots')
      .join('events', 'id', '=', 'events.id')
      .select('organizers.name')
      .where({url: url})
      .then((rows) => {
        organizer = rows[0]
        return resolve(organizer);
      })
    })
  }

  //CREATES TIMESLOT
  function createTimeslot(eventID, startTime) {

  }

}
