const pg = require ('pg')

const client = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'dbtodolist',
    password: 'root',
    port: 5432
})

module.exports = client