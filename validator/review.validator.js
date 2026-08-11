const { body, param } = require('express-validator');

exports.createReviewValidator = [
  param('productId').isMongoId().withMessage('ID produk tidak valid'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus 1-5'),
  body('comment').optional().trim(),
];

exports.updateReviewValidator = [
  param('id').isMongoId().withMessage('ID review tidak valid'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating harus 1-5'),
];