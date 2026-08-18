const express = require('express');
const productController = require('../controller/product.controller');
const reviewController = require('../controller/review.controller');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} = require('../validator/product.validator');
const { createReviewValidator } = require('../validator/review.validator');

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Ambil semua produk
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Daftar produk berhasil diambil
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Ambil detail satu produk
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail produk berhasil diambil
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get('/:id', productIdValidator, handleValidationErrors, productController.getProduct);

/**
 * @swagger
 * /products/{productId}/reviews:
 *   get:
 *     summary: Ambil semua review untuk sebuah produk
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar review berhasil diambil
 *   post:
 *     summary: Tambah review untuk sebuah produk
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: integer
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Barangnya bagus dan cepat sampai
 *     responses:
 *       201:
 *         description: Review berhasil ditambahkan
 *       400:
 *         description: Input tidak valid
 *       401:
 *         description: Belum login
 */
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post(
  '/:productId/reviews',
  protect,
  createReviewValidator,
  handleValidationErrors,
  reviewController.createReview
);

router.use(protect, restrictTo('admin'));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Buat produk baru (admin only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tenda Dome 4 Orang
 *               price:
 *                 type: number
 *                 example: 850000
 *               stock:
 *                 type: number
 *                 example: 20
 *               category:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       201:
 *         description: Produk berhasil dibuat
 *       400:
 *         description: Input tidak valid
 *       403:
 *         description: Bukan admin
 */
router.post('/', createProductValidator, handleValidationErrors, productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update produk (admin only)
 *     tags: [Product]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tenda Dome 6 Orang
 *               price:
 *                 type: number
 *                 example: 950000
 *     responses:
 *       200:
 *         description: Produk berhasil diupdate
 *       404:
 *         description: Produk tidak ditemukan
 *   delete:
 *     summary: Hapus produk (admin only)
 *     tags: [Product]
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
 *         description: Produk berhasil dihapus
 *       404:
 *         description: Produk tidak ditemukan
 */
router.patch(
  '/:id',
  updateProductValidator,
  handleValidationErrors,
  productController.updateProduct
);
router.delete('/:id', productIdValidator, handleValidationErrors, productController.deleteProduct);

module.exports = router;