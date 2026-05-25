const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/apiController');

router.get('/products', ApiController.getProducts);
router.post('/products', ApiController.createProduct);
router.delete('/products/delete', ApiController.deleteProduct);
router.get('/orders', ApiController.getOrders);
router.get('/shop-info', ApiController.getShopInfo);
router.delete("/delete-theme" , ApiController.deleteShopTheme) 
router.delete("/delete-single-theme", ApiController.deleteSingleTheme);

module.exports = router;
