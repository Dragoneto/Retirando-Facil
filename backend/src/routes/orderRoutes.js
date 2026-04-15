const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/pedidos', orderController.createOrder);
router.get('/admin/pedidos', orderController.getAllOrders);
router.put('/admin/pedidos/:id/status', orderController.updateOrderStatus);

module.exports = router;