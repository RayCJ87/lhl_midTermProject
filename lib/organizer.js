module.exports = function(knex) {


  //RETURNS ORGANIZER ROW FROM DB BY ID
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
          // return console.log('find: ', organizer)
        }
        else {
          return reject()
        }
      })
      .catch((error) => reject(error));
    })
  }
  // SAME AS ABOVE BUT NOT PROMISE
  // function findID(input) {
  //   let query = knex('organizers').select();
  //   if (input) {
  //     query = query.where('id', '=', `${input}`)
  //   }
  //   query.then(rows => console.log(rows))
  // }

  //FINDS ORGANIZER BY EMAIL
  function findByEmail(email) {
    return new Promise((resolve, reject) => {
      knex('organizers')
      .select('*')
      .where({email: email})
      .limit(1)
      .then((rows) => {
        organizer = rows[0]
        return resolve(organizer)
        // return console.log('findByEmail: ', organizer)
      })
      .catch((error) => reject(error));
    })
  }

  //CHECKS IF ORGANIZER EMAIL IS UNIQUE
  function doesEmailExist(email) {
    return new Promise((resolve) => {
      findByEmail(email)
      .then((organizer) => {
        if (!organizer) {
          return resolve(email);
        }
      })
    })
  }
  //ADDS A NEW ORGANIZER
  //**moved to lib/event.js**
  // function addOrganizer(email, name) {
  //   return (
  //     doesEmailExist(email)
  //     .then((email) => {
  //       return name;
  //     })
  //     .then((name) => {
  //       return knex('organizers').insert({
  //         name: name,
  //         email: email
  //       })
  //     })
  //   );
  // }


  return {
    find: find,
    findByEmail: findByEmail
    // addOrganizer: addOrganizer
  }
}
