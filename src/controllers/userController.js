const crypto = require('crypto')
const mailController = require('../controllers/mailController')
const Activity = require('../util/activity');

const knex = require('../config/db.config')
const { attachPaginate } = require('knex-paginate');
attachPaginate();
const jwt = require('jsonwebtoken')
const axios = require('axios');
const uploadController = require('./uploadController');
const { update } = require('../config/db.config');
const scoreCalculator = require('../util/scoreCalculator');

const SECRET = process.env.SECRET_TOKEN

class UserController {
        // =======================================INSERIR TAREFA=======================================================
    insertTask(req, res) {

        const { desctarefa, nometarefa, quemfaz, realizado} = req.body

        knex('tbtodolist')
        .insert({
            desctarefa,
            nometarefa,
            quemfaz,
            realizado
        }).then(res => {
            console.log(res);
        },
        error =>{
            console.log(erro)
        }
        )
    }

    getTasks(req, res) {

        const currentPage = req.query.p;

        const sort = req.query.s;
        let order = 'asc';
        const search = req.query.find;
        const alphabeticOrder = req.query.order;


        try {

            const query = knex('tbtodolist')
                .select('*')
        
                .then(rows => {
                    if(sort === 'final_score') {
                        const data = rows.data.map((row, index) => {

                            let page = Number(currentPage);
                            let position = (index + 1) + (page - 1) * 10;
                            return { ...row, position};

                        });

                        const pagination = rows.pagination;
                        const users = {
                            data,
                            pagination
                        }

                        return res.json(users);
                    }

                    res.json(rows)
                },
                error => {
                    console.log(error)
                    res.status(500)
                })

        } catch(error) {
            console.log(error)
            res.status(500)
        }

    }


    alterUser(req, res) {

        let guid = req.guid
        let { ...data } = req.body

        if (Object.entries(data).length === 0) {
            return res.status(400).json({ message: 'Nenhum dado informado na requisição!' }).end()
        }
        knex('user_system').update({ first_name: data.first_name, last_name: data.last_name, phone_number: data.phone_number })
            .where({ guid })
            .then(data => {
                if (data != 1) {
                    return res.status(404).json({ message: 'Usuário não encontrado' }).end()
                }
            let { ...update_data } = req.body
            knex('user_system_subscription').update({ birth_date: update_data.birth_date, cpf: update_data.cpf })
                .where({ user_guid: guid })
                .then(data => {
                    return res.json({ code:1, message: 'Dados salvos com sucesso!' }).end()
                }).catch(error => {
                    console.log(error)
                    return res.status(500).json({ error }).end()
                })
            }).catch(error => {
                console.log(error)
                return res.status(500).json({ error }).end()
            })
    }

    deleteTask(req, res){
        let task = req.idtarefa 

        knex('tbtodolist')
        .where({ task })
        .del().then(data =>{
            console.log(data)
        }).catch(error => {
            console.log(error)
        })
    }



    // ===============================================NÃO APAGAR=====================================================
    getSubscriptionStatus(req, res) {

        let user_guid = req.guid

        knex('user_system_subscription')
            .select('is_register_valid')
            .where({ user_guid })
            .then(data => {
                const { is_register_valid } = data[0];
                return res.json({ is_register_valid }).end()
            }).catch(error => {
                console.log(error)
                return res.status(500).end()
            })
    }

    updateSubscriptionStatus(req, res) {

        let user_guid = req.guid

        knex('user_system_subscription')
            .update({ is_register_valid: true })
            .where({ user_guid })
            .then(data => {
                return res.json({ data }).end()
            }).catch(error => {
                console.log(error)
                return res.status(500).end()
            })
    }

    confirmEmail(req, res) {

        const mailToken = req.query.tkn;

        jwt.verify(mailToken, SECRET, (error, decoded) => {

            if(error) return res.status(401).end()

            try {
                knex('user_system_subscription')
                    .update({
                        checkmail: 1,
                        id_profile: 3
                    })
                    .where({ user_guid: decoded.guid })
                    .then(
                        data => {
                            return res.json({ data });
                        },
                        error => {
                            console.log(error)
                            return res.status(500).end()
                        }
                    )
            } catch(error) {
                console.log(error)
                return res.status(500).end()
            }

        })

    }
// ===============================================NÃO APAGAR=====================================================
  
    
    

   

   
    

    

   
}

module.exports = new UserController()
