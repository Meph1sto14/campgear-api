const { body, param } = require('express-validator');

exports.createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi'),
];

exports.updateCategoryValidator = [
  param('id').isMongoId().withMessage('ID kategori tidak valid'),
  body('name').optional().trim().notEmpty().withMessage('Nama kategori tidak boleh kosong'),
];

exports.categoryIdValidator = [param('id').isMongoId().withMessage('ID kategori tidak valid')];