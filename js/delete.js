const db = require('./databse')

async function deletetb(){
    await db.connect()
    await db.query(`DROP TABLE [nome da tabela] CASCADE`)

    await db.end()
}

deletetb()

