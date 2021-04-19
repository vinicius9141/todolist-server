const db = require ('./databse')

async function getTask(){
    await db.connect()
    var result

    result = await db.query("SELECT * FROM tbtodolist")
    console.log('Tasks:')
    console.log(result.rows);
}

getTask()