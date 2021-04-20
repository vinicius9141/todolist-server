var database = require ('./database')


var data = {
    desctarefa: "DESC TAREFA KNEX",
    nometarefa: "NOME TAREFA KNEX",
    quemfaz: "GABRIEL/VINICIUS KNEX",
    realizado: false,
}


database.insert(data).into("tbtodolist").then(data =>{
    console.log(data);
}).catch(err => {
    console.log(err);
})
