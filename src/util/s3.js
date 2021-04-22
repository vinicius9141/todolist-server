module.exports = {

    buildPath(req) {
        return {
            "completePath": `${req.imgFormated}`,
            "incompletePath": `#$#server_path#$#/autoria/${req.incompletePath}`
        }
    }
}