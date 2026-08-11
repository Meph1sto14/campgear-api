const { body, param } = require('express-validator');

exports.checkoutValidator = [
  body('shippingAddress').trim().notEmpty().withMessage('Alamat pengiriman wajib diisi'),
];

exports.updateStatusValidator = [
  param('id').isMongoId().withMessage('ID order tidak valid'),
  body('status')
    .isIn(['pending', 'paid', 'processed', 'shipped', 'completed', 'cancelled'])
    .withMessage('Status tidak valid'),
];