const sendGridConfig = require('../config/sendGrid.config')
const knex = require('../config/db.config')
const axios = require('axios')
// TODO substituir pelos link da entrevista
const LINK_ENTREVISTA = 'https://doodle.com/poll/y6uhcafayfeccms8'
const LINK_PROVA = 'https://nau.tamboro.com.br/'

class CronMailer {

    async sendEmail(template_id, emails, link = '') {

        const instance = await axios.create({
            baseUrl: sendGridConfig.baseUrl,
            headers: sendGridConfig.headers
        })

        instance.post(sendGridConfig.postLink, {

            personalizations: [{
                to: emails,
                substitutions: {
                    "${link}": link,
                    ...sendGridConfig.substitutions
                }
            }],

            from: sendGridConfig.from,

            template_id: template_id

        })

        return instance

    }

    async getMissingExamEmails() {

        const users = await knex('v_0_user_subscription')
            .select('email', 'multiple_choice', 'study_case', 'redaction')

        const emails = users
            .filter((user) => {
                return user.multiple_choice != "FINISHED"
            })
            .map((user) => {
                let email = {
                    email: user.email
                }
                return email
            })

        return emails

    }

    async filterNotifiedEmails(emaiTemplatelId) {

        const users = await knex('v_0_user_subscription').leftJoin('notification', 'v_0_user_subscription.id_user', 'notification.id_user')
            .select('v_0_user_subscription.id_user', 'v_0_user_subscription.email', 'notification.notification_data')
            .where('v_0_user_subscription.multiple_choice', 'FINISHED')
            .where('v_0_user_subscription.id_profile', 3)

        const filteredUsers = users
            .filter((user) => {
                if (user.notification_data == null || user.notification_data.MAIL_DATA.template_id != emaiTemplatelId) {
                    return user
                }
            })
            .map((user) => {
                let userData = {
                    id_user: user.id_user,
                    email: user.email,
                }

                return userData
            })

        return filteredUsers

    }

    async interviewNotify() {

        const template_id = '8709b1e6-8732-456e-a517-64c90b2941e9'

        const users = await this.filterNotifiedEmails(template_id)

        if (users.length < 1) return

        const emails = users
            .map((user) => {

                const userEmails = {
                    email: user.email
                }

                return userEmails
            })

        const notification_data = {
            MAIL_DATA: {
                template_id
            }
        }

        const formattedUsers = users
            .map((user) => {
                
                const newUser = {
                    id_user: user.id_user,
                    senton: 'now()',
                    notification_data,
                    send_via: '["email"]'

                }

                return newUser
            })

        const sendMail = this.sendEmail(template_id, emails, LINK_ENTREVISTA)
            .then(
                result => {
                    const data = knex('notification')
                        .insert(formattedUsers)

                    return data;

                }
            )
            .catch(
                error => {
                    return error
                }
            )

        return sendMail

    }

    async deadLineNotify() {

        const emails = await this.getMissingExamEmails()
        const sendMail = this.sendEmail('04c31e06-79ff-4448-87ca-7a0184a22f6f', emails, LINK_PROVA)

        return sendMail

    }

}

module.exports = new CronMailer()