const express = require('express')
const router = express.Router()
const multerS3 = require('multer-s3');
const aws = require('aws-sdk')
const multer = require('multer');

const uuid = require('uuid');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const mailController = require('../controllers/mailController')

router.get('/', (req, res) => {
    res.json({
        message: 'Bem vindo à API de inscrição da Nau.',
    })
})

aws.config.update({
    secretAccessKey: 'GolzRPlvuN7MN5y6RetkqCmfwWGFjSfVKdcdwnTV',
    accessKeyId: 'AKIAJMJGOJABLTYEMZXA',
    region: 'us-east-1'
});

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: function (req, file, cb) {
            cb(null, req.bucket + "/subscription")
        },
        key: async function (req, file, cb) {


            let extArray = file.mimetype.split("/");
            let extension = extArray[extArray.length - 1];
            const identifierImage = uuid.v4();
            req.incompletePath = identifierImage + "." + extension;
            req.imgFormated = `https://${req.bucket}.s3.us-east-1.amazonaws.com/subscription/${identifierImage}.${extension}`


            cb(null, identifierImage + "." + extension)
        }
    }),
    toFormat: {
        progressive: true,
        quality: 50
    }
});








router.post('/inserttaks', userController.insertTask)
router.get('/gettasks', userController.getTasks)
router.put('/user-subscription-status', authController.verifyJWT, userController.updateSubscriptionStatus)
router.delete('/deletetasks',userController.deleteTask)



module.exports = router
