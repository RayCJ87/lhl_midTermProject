module.exports = function(knex) {

//allow to delete timeslots
//show just timeslots

  //RETURNS EVENT ID
  function getEventID(url) {
    return new Promise((resolve, reject) => {
      knex('events')
      .select('id')
      .where({url: url})
      .then((rows) => {
        eventID = rows[0]
        if (eventID) {
          return resolve(eventID)
        }
        else {
          return reject()
        }
      })
      .catch((error) => reject(error));
    })
  }

  //CREATES TIMESLOT
  function createTimeslot(url, startTime) {
    return (
      getEventID(url)
      .then(eventID) => {
        return startTime;
      })
    .then((startTime) => {
      return knex('timeslots').insert({
        start_time: startTime,
        event_id: eventID
      })
    });
  }


  return {
    createTimeslot: createTimeslot
  };
}
