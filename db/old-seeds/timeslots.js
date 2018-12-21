
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('timeslots').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('timeslots').insert({start_time: '01/04/2019 06:00 PM', end_time: '01/04/2019 8:00 PM', event_id: '3'}),
        knex('timeslots').insert({start_time: '01/04/2019 07:00 PM', end_time: '01/04/2019 9:00 PM', event_id: '3'}),
        knex('timeslots').insert({start_time: '01/04/2019 07:30 PM', end_time: '01/04/2019 9:30 PM', event_id: '3'})
      ]);
    });
};
