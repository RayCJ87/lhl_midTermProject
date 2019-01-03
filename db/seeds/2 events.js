
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('events').insert({url: 'a1b2c3d4e5f6g7h8i9j0', name: 'Coding Downtown', description: 'I want to meet up and practice coding.', location: 'King and Bathhurst', organizer_id: '2'})
      ]);
    });
};
