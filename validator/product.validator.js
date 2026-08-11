const { body, param } = require('express-validator');

exports.createProductValidator = [
  body('name').trim().notEmpty().withMessage('Nama produk wajib diisi'),
  body('price').isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('stock').isInt({ min: 0 }).withMessage('Stok harus angka bulat, minimal 0'),
  body('category').isMongoId().withMessage('ID kategori tidak valid'),
];

exports.updateProductValidator = [
  param('id').isMongoId().withMessage('ID produk tidak valid'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stok harus angka bulat, minimal 0'),
  body('category').optional().isMongoId().withMessage('ID kategori tidak valid'),
];

exports.productIdValidator = [param('id').isMongoId().withMessage('ID produk tidak valid')];