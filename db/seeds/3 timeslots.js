
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('timeslots').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('timeslots').insert({start_time: '2019-01-04 18:00', event_id: '1'}),
        knex('timeslots').insert({start_time: '2019-01-04 19:00', event_id: '1'}),
        knex('timeslots').insert({start_time: '2019-01-04 19:30', event_id: '1'})
      ]);
    });
};
