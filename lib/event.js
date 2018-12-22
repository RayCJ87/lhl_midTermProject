const organizer = require('/organizer');

module.exports = function(knex) {

  //RETURNS EVENT ROW FROM DB BY ID
  function find(id) {
    return new Promise((resolve, reject) => {
      knex('events')
      .select('*')
      .where({id: id})
      .limit(1)
      .then((rows) => {
        event = rows[0]
        if (event) {
          return resolve(event)
        }
        else {
          return reject()
        }
      })
      .catch((error) => reject(error));
    })
  }

  //RETURNS EVENT ROW FROM DB BY URL
  function findByURL(url) {
    return new Promise((resolve, reject) => {
      knex('events')
      .select('*')
      .where({url: url})
      .limit(1)
      .then((rows) => {
        event = rows[0]
        if (event) {
          return resolve(event)
        }
        else {
          return reject()
        }
      })
      .catch((error) => reject(error));
    })
  }

  //RETURNS ORGANIZER OF EVENT
  function joinOrganizer(url) {
    return new Promise((resolve) => {
      knex('events')
      .join('organizers', 'events.organizer_id', '=', 'organizers.id')
      .select('organizers.name')
      .where({url: url})
      .then((rows) => {
        organizer = rows[0]
        return resolve(organizer);
      })
    })
  }

  //ADDS EVENT TO DB
  // ***make sure organizers.id is added before event starts to be added
  function createEvent(email, organizerName, eventName, description, location) {
    return (
      organizer.doesEmailExist(email)
      .then((email) => {
        return organizerName;
      })
      .then((organizerName) => {
        return knex('organizers').insert({
          name: name,
          email: email
        })
      })
      .then((resolve, reject) => {
        knex('organizers')
        .select('id')
        .where({id: id})
        .then((rows) => {
          id = rows[0]
          if (id) {
            return resolve(id)
          }
          else {
            return reject()
          }
        })
        .catch((error) => reject(error));
      })
      .then((organizer_id) => {
        return knex('events').insert({
          name: eventName,
          description: description,
          location: location,
          organizer_id: organizer_id
        })
      })
    );
  }

  return {
    find: find,
    findByURL: findByURL,
    joinOrganizer: joinOrganizer,
    createEvent: createEvent
  }
}
