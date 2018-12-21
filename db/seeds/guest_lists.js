
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('guest_lists').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('guest_lists').insert({attendee_id: '8', timeslot_id: '3'}),
        knex('guest_lists').insert({attendee_id: '8', timeslot_id: '4'}),
        knex('guest_lists').insert({attendee_id: '9', timeslot_id: '4'}),
      ]);
    });
};
