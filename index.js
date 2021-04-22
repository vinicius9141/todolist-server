const { json } = require('express')
const cors = require('cors')
const express = require('express')
const cron = require('node-cron')
const app = express()

const routes = require('./src/routes/routes')
const mailer = require('./src/util/cronMailer')

app.use(cors({
    origin: '*'
}));

app.use(json())
app.use(routes)

// 0 10 22 2 * - Às 10:00h do dia 22/02/2021

cron.schedule('0 10 22 2 *', () => {
    mailer.deadLineNotify()
    .catch(
        error => {
            console.error('UNEXPECTED ERROR: ', error)
        }
    )
}, {
    timezone: 'Etc/UTC'
})

// 0 6,12,15,18 * * * - TODOS OS DIAS às 6h, 12h, 15h, 18h

cron.schedule('0 6,12,18 * * *', () => {
    mailer.interviewNotify()
    .then(
        success => console.log('Notificações referentes à entrevista enviadas!')
    )
    .catch(
        error => {
            console.error('UNEXPECTED ERROR: ', error)
        }
    )
}, {
    timezone: 'Etc/UTC'
})


app.listen(3000, () => {
    console.log('Application running at port 3000')
})