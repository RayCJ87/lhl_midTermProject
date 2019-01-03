

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('organizers').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('organizers').insert({name: 'John Smith', email: 'john.smith@example.com'}),
        knex('organizers').insert({name: 'Adam Jones', email: 'ajones@example.com'}),
        knex('organizers').insert({name: 'Sarah Pearson', email: 'sarah@example.com'})
      ]);
    });
};