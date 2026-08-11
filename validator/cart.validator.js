const { body, param } = require('express-validator');

exports.addItemValidator = [
  body('productId').isMongoId().withMessage('ID produk tidak valid'),
  body('quantity').isInt({ min: 1 }).withMessage('Jumlah minimal 1'),
];

exports.updateItemValidator = [
  param('productId').isMongoId().withMessage('ID produk tidak valid'),
  body('quantity').isInt({ min: 1 }).withMessage('Jumlah minimal 1'),
];