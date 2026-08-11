const express = require('express');
const reviewController = require('../controller/review.controller');
const protect = require('../middleware/protect');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const { updateReviewValidator } = require('../validator/review.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Update review milik sendiri
 *     tags: [Review]
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
 *               rating:
 *                 type: integer
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Update komentar review
 *     responses:
 *       200:
 *         description: Review berhasil diupdate
 *       403:
 *         description: Bukan pemilik review
 *       404:
 *         description: Review tidak ditemukan
 *   delete:
 *     summary: Hapus review milik sendiri
 *     tags: [Review]
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
 *         description: Review berhasil dihapus
 *       403:
 *         description: Bukan pemilik review
 *       404:
 *         description: Review tidak ditemukan
 */
router.patch(
  '/:id',
  updateReviewValidator,
  handleValidationErrors,
  reviewController.updateReview
);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;