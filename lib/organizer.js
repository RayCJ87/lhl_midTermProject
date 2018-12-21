module.exports = function(knex) {

  function find(id) {
    return new Promise((resolve, reject) => {
      knex('organizers')
      .select('*')
      .where({id: id})
      .limit(1)
      .then((rows) => {
        organizer = rows[0]
        if (organizer) {
          return resolve(organizer)
        }
        else {
          return reject()
        }
      })
      .catch((error) => reject(error));
    })
  }

  return {
    find: find
  }
}
