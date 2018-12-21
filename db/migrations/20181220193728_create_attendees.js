
exports.up = function(knex, Promise) {
  return knex.schema.createTable('attendees', function (table) {
    table.increments('id').unsigned().notNullable();
    table.string('name').notNullable();
    table.string('email').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('attendees');
};
