

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('attendees').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('attendees').insert({name: 'Peter Andrews', email: 'peter@example.com'}),
        knex('attendees').insert({name: 'Robert West', email: 'west@example.com'}),
        knex('attendees').insert({name: 'Amy Shoes', email: 'amy.shoes@example.com'})
      ]);
    });
};