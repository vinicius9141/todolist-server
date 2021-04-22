const s3 = require('../util/s3')

module.exports = {
    upload(req, res) {
        try {
            let paths = s3.buildPath(req)
            return paths.completePath
        } catch (error) {
            console.log(error)
            return res.status(500)
        }
    }
}