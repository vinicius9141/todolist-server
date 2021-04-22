require('dotenv').config()

const sendGridConfig = {

    baseUrl: 'https://api.sendgrid.com/v3/mail/send',
    headers: {
        'Authorization': `Bearer ${process.env.SG_TOKEN}`
    },

    substitutions: {
        "${contact_email}": "contato@tamboro.com.br"
    },

    from: {
        email: "noreply@tamboro.com.br",
        name: "NAU"
    },

    postLink: 'https://api.sendgrid.com/v3/mail/send'
    
}

module.exports = sendGridConfig