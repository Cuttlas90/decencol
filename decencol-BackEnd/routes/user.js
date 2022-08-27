const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', function (req, res, next) {
    res.json('user');
});

router.post('/getNonce', controller.getNonce);
router.post('/loginWithPublicKey', controller.loginWithPublicKey);
router.post('/createFile', auth.auth, controller.createFile);
router.get('/getMyFiles', auth.auth, controller.getMyFiles);
router.post('/shareFile', auth.auth, controller.shareFile);
router.get('/getFile/:id', auth.auth, controller.getFile);
router.post('/editFile', auth.auth, controller.editFile);

module.exports = router;