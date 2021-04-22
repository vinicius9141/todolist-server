const knex = require('../config/db.config')
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET_TOKEN

class AuthController {

    verifyJWT(req, res, next) {

        if (!req.headers['authorization']) {
            return res.status(401).json({ message: 'Token não informado!' })
        }

        let parts = req.headers['authorization'].split(' ')
        let [scheme, token] = parts

        if (scheme != 'Bearer') {
            return res.status(401).json({ message: 'Token mal formatado!' })
        }

        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ code: 2, message: 'Sua sessão expirou! Autentique-se novamente através do login!' }).end()

            req.guid = decoded.guid
            req.bucket = decoded.bucket
            next()
        })
    }

    authenticateUser(req, res) {

        let { email, password } = req.body

        knex.raw(`SELECT id_user, uss.checkmail, us.first_name, us.last_name, us.email, us.password, us.guid, sp.name FROM user_system us INNER JOIN user_system_subscription uss
        ON us.guid = uss.user_guid LEFT JOIN subscription_profile sp ON sp.id_profile = uss.id_profile
        WHERE us.email = '${email}'`)
            .then(data => {
                if (data.rowCount > 0) {

                    if(data.rows[0].checkmail != 1 && data.rows[0].name == null) {
                        return res.status(403).end();
                    }

                    if (data.rows[0].password === password) {
                        const token = jwt.sign({
                            first_name: data.rows[0].first_name,
                            last_name: data.rows[0].last_name,
                            id_user: data.rows[0].id_user,
                            guid: data.rows[0].guid,
                            profile: data.rows[0].name,
                            email: data.rows[0].email,
                            bucket: 'tamboro-nau-prod'
                        }, SECRET, { expiresIn: '24h' })
                        return res.json({
                                code: 1,
                                token
                            })
                    }
                    return res.status(401).json({
                        code: 2,
                        message: 'E-mail ou senha não conferem!'
                    }).end()
                }
                return res.status(401).json({
                    code: 3,
                    message: 'E-mail ou senha não conferem!'
                }).end()
            }).catch(
                error => {
                    console.log(error)
                    res.status(500)
                }
            )

    }

    validateToken(req, res) {

        let parts = req.headers['authorization'].split(' ')
        let token = parts[1]

        jwt.verify(token, SECRET, (err, decoded) => {

            if (err) return res.status(401).end()

            let newToken = jwt.sign({ guid: decoded.guid }, SECRET, { expiresIn: '20m' })
            res.json({ newToken }).end()

        })
    }

    generateMailToken(guid) {

        const token = jwt.sign({ guid }, SECRET, { expiresIn: '24h'})
        return token;

    }
}


module.exports = new AuthController()
