const express = require('express');
const orderController = require('../controller/order.controller');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const { checkoutValidator, updateStatusValidator } = require('../validator/order.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Checkout keranjang jadi order baru
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address]
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 example: Jl. Merdeka No. 10, Purwokerto
 *     responses:
 *       201:
 *         description: Order berhasil dibuat
 *       400:
 *         description: Keranjang kosong / input tidak valid
 */
router.post('/checkout', checkoutValidator, handleValidationErrors, orderController.checkout);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Ambil semua order milik user yang login
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar order berhasil diambil
 */
router.get('/', orderController.getMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Ambil detail satu order milik user yang login
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail order berhasil diambil
 *       404:
 *         description: Order tidak ditemukan
 */
router.get('/:id', orderController.getOrder);

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Ambil semua order dari semua user (admin only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua order berhasil diambil
 *       403:
 *         description: Bukan admin
 */
router.get('/admin/all', restrictTo('admin'), orderController.getAllOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update status order (admin only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Status order berhasil diupdate
 *       403:
 *         description: Bukan admin
 *       404:
 *         description: Order tidak ditemukan
 */
router.patch(
  '/:id/status',
  restrictTo('admin'),
  updateStatusValidator,
  handleValidationErrors,
  orderController.updateOrderStatus
);

module.exports = router;