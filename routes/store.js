const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/storeController');

router.post('/add-app', StoreController.addApp);
router.post('/remove-app', StoreController.removeApp);
router.post('/add-manual-token', StoreController.addManualToken);
router.post('/remove-store', StoreController.removeStore);

module.exports = router;
