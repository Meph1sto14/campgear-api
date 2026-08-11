const { body } = require('express-validator');

exports.paymentWebhookValidator = [
  body('orderId').isMongoId().withMessage('ID order tidak valid'),
  body('paymentStatus').isIn(['paid', 'failed']).withMessage('paymentStatus harus paid atau failed'),
];