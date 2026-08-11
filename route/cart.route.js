const express = require('express');
const cartController = require('../controller/cart.controller');
const protect = require('../middleware/protect');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const { addItemValidator, updateItemValidator } = require('../validator/cart.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Ambil isi keranjang user yang login
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data keranjang berhasil diambil
 *       401:
 *         description: Belum login / token tidak valid
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Tambah item ke keranjang
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item berhasil ditambahkan
 *       400:
 *         description: Input tidak valid
 *       401:
 *         description: Belum login
 */
router.post('/items', addItemValidator, handleValidationErrors, cartController.addItem);

/**
 * @swagger
 * /cart/items/{productId}:
 *   patch:
 *     summary: Update jumlah item di keranjang
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Jumlah item berhasil diupdate
 *       400:
 *         description: Input tidak valid
 *       404:
 *         description: Item tidak ditemukan di keranjang
 *   delete:
 *     summary: Hapus item dari keranjang
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Item berhasil dihapus dari keranjang
 *       404:
 *         description: Item tidak ditemukan di keranjang
 */
router.patch(
  '/items/:productId',
  updateItemValidator,
  handleValidationErrors,
  cartController.updateItemQuantity
);
router.delete('/items/:productId', cartController.removeItem);

module.exports = router;