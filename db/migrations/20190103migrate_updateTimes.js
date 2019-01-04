
exports.up = function(knex, Promise) {
  return knex.schema.createTable('updatetimes', function (table) {
    table.increments('id').unsigned().notNullable();
    table.string('startTime');
    table.string('url');
    table.string('name');
    // table.integer('event_id').unsigned().notNullable();
    // table.foreign('event_id').references('id').inTable('events')

  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('updatetimes');
};
