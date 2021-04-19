const db = require ('./databse')

async function insertTask(){
    await db.connect()

  
    const queryTaskNome = "INSERT INTO tbtodolist (nometarefa, desctarefa, quemfaz, realizado) VALUES ($1, $2, $3, $4)"
    await db.query(queryTaskNome , ['Task teste 2 1906', 'Desc task teste 2 1906' , 'Vinicius/Gabriel', true])
    


    await db.end

    console.log('Dados inseridos com sucesso')
}

insertTask()