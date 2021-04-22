require('dotenv').config()
const nodemailer = require('nodemailer')
const axios = require('axios')
const sendGridConfig = require('../config/sendGrid.config')
const { generatePassword } = require('../util/passwordGenerator')
const authController = require('./authController')
const knex = require('../config/db.config')
const crypto = require('crypto')
const EMAIL_SECRET = process.env.EMAIL_SECRET

class MailController {

    async passwordRecoverMail(req, res) {

        let userData = '';

        try {
            userData = await knex('user_system')
                .select(
                    'user_system.first_name',
                    'login_token.token_value'
                )
                .innerJoin('login_token', 'login_token.id_user', 'user_system.id_user')
                .where('email', req.body.email)
        } catch(error) {
            console.log(error)
            return res.status(500)
                .end()
        }

        const tokenObj = {
            email: req.body.email,
            token: userData[0].token_value
        }

        const bufferObj = Buffer.from(JSON.stringify(tokenObj), 'utf-8')
        const token = bufferObj.toString("base64")

        req.template_id = '4350bd67-70f4-4725-b7cc-8456d6a132d4'

        req.first_name = userData[0].first_name
            // TROCAR PELA URL DA PRODUÇÃO
        const link = process.env.SUBSCRIPTION_URL + `/#/nova-senha?tkn=${token}`

        req.link = link;

        this.sendGridMail(req, res);

    }

    sendGridMail(req, res) {

        let { template_id, link, first_name } = req
        let emails;

        if (req.multi_mail) {
            emails = req.body.emails
        } else {
            emails = [
                {
                    email: req.body.email
                }
            ]
        }

        const instance = axios.create({
            baseUrl: sendGridConfig.baseUrl,
            headers: sendGridConfig.headers
        })

        instance.post(sendGridConfig.postLink, {

            personalizations: [{
                to: emails,
                substitutions: {
                    "${link}": link,
                    "${first_name}": first_name,
                    ...sendGridConfig.substitutions
                }
            }],

            from: sendGridConfig.from,

            template_id: template_id

        }).then(data => {

            const message = req.multi_mail? `E-mail enviado aos destinatários!`: `E-mail enviado com sucesso para o endereço ${emails[0].email}`

            return res.status(data.status).json({
                code: 1,
                message
            }).end()
        }, error => {
            console.log(error)
            return res.status(500).end()
        })
    }

    sendValidationMail(req, res) {

        knex('user_system')
            .select('guid')
            .where({ email: req.email })
            .then(
                data => {

                    const mailToken = authController.generateMailToken(data[0].guid)
                    req.template_id = 'd2eaf1c6-af3c-4817-8782-5e1536257738'
                    // TROCAR PELO LINK DA PRODUÇÃO
                    req.link = process.env.SUBSCRIPTION_URL + `/#/?tkn=${mailToken}`

                    this.sendGridMail(req, res)
                },
                error => {
                    console.log(error)
                    return res.status(500).end()
                }
            )
    }

    sendFinalSubscriptionMail(req, res) {

        knex('user_system')
            .select('email')
            .where({ guid: req.guid})
            .then(
                data => {
                    req.link = `https://nau.tamboro.com.br/`
                    req.body.email = data[0].email
                    req.template_id = '36199f37-8cf6-493c-b2b8-294d71ed8931'

                    this.sendGridMail(req, res)
                },
                error => {
                    res.status(500).end()
                }
            ).catch(error => {
                res.status(500).end()
            })

    }

    sendMailNotification(req, res) {

        const { template_id } = req.body
        req.multi_mail = true
        req.template_id = template_id

        this.sendGridMail(req, res)

    }
}

module.exports = new MailController()
