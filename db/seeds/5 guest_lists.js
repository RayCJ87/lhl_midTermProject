
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('guest_lists').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('guest_lists').insert({attendee_id: '2', timeslot_id: '1'}),
        knex('guest_lists').insert({attendee_id: '2', timeslot_id: '2'}),
        knex('guest_lists').insert({attendee_id: '3', timeslot_id: '2'}),
      ]);
    });
};
