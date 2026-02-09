const express = require('express');
const router = express.Router();
const OAuthController = require('../controllers/oauthController');

router.get('/install', OAuthController.install);
router.get('/auth', OAuthController.callback);

module.exports = router;
