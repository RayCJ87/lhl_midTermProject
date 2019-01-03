exports.up = function(knex, Promise) {
  return knex.schema.createTable('events', function (table) {
    table.increments('id').unsigned().notNullable();
    table.string('url');
    table.string('name').notNullable();
    table.string('description');
    table.string('location');
    table.integer('organizer_id').unsigned().notNullable();

    table.foreign('organizer_id').references('id').inTable('organizers');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events');
};