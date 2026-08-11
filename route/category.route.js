const express = require('express');
const categoryController = require('../controller/category.controller');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} = require('../validator/category.validator');

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Ambil semua kategori
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil
 */
router.get('/', categoryController.getAllCategories);

router.use(protect, restrictTo('admin'));

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Buat kategori baru (admin only)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tenda
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       400:
 *         description: Input tidak valid
 *       403:
 *         description: Bukan admin
 */
router.post('/', createCategoryValidator, handleValidationErrors, categoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update kategori (admin only)
 *     tags: [Category]
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
 *                 example: Tenda Outdoor
 *     responses:
 *       200:
 *         description: Kategori berhasil diupdate
 *       404:
 *         description: Kategori tidak ditemukan
 *   delete:
 *     summary: Hapus kategori (admin only)
 *     tags: [Category]
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
 *         description: Kategori berhasil dihapus
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.patch(
  '/:id',
  updateCategoryValidator,
  handleValidationErrors,
  categoryController.updateCategory
);
router.delete(
  '/:id',
  categoryIdValidator,
  handleValidationErrors,
  categoryController.deleteCategory
);

module.exports = router;