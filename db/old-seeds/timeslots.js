
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('timeslots').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('timeslots').insert({start_time: '01/04/2019 06:00 PM', event_id: '1'}),
        knex('timeslots').insert({start_time: '01/04/2019 07:00 PM', event_id: '1'}),
        knex('timeslots').insert({start_time: '01/04/2019 07:30 PM', event_id: '1'})
      ]);
    });
};

