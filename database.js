var knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
      host : 'localhost',
      user : 'postgres',
      password : 'root',
      database : 'dbtodolist'
    }
  });


  module.exports = knex