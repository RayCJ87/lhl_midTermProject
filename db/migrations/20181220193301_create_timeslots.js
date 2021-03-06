
exports.up = function(knex, Promise) {
  return knex.schema.createTable('timeslots', function (table) {
    table.increments('id').unsigned().notNullable();
    table.dateTime('start_time');

    table.integer('event_id').unsigned().notNullable();

    table.foreign('event_id').references('id').inTable('events');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('timeslots');
};
