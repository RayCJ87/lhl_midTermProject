exports.up = function(knex, Promise) {
  return knex.schema.createTable('guest_lists', function (table) {
    table.integer('attendee_id').unsigned().notNullable();
    table.integer('timeslot_id').unsigned().notNullable();

    table.foreign('attendee_id').references('id').inTable('attendees');
    table.foreign('timeslot_id').references('id').inTable('timeslots');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('guest_lists');
};