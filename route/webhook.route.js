const express = require('express');
const webhookController = require('../controller/webhook.controller');
const webhookRateLimiter = require('../middleware/webhookRateLimiter');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const { paymentWebhookValidator } = require('../validator/webhook.validator');

const router = express.Router();

/**
 * @swagger
 * /webhook/payment:
 *   post:
 *     summary: Terima callback pembayaran dari payment gateway
 *     tags: [Webhook]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, paymentStatus]
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               paymentStatus:
 *                 type: string
 *                 example: paid
 *     responses:
 *       200:
 *         description: Callback berhasil diproses
 *       401:
 *         description: API key tidak valid
 *       400:
 *         description: Input tidak valid
 *       429:
 *         description: Terlalu banyak request
 */
router.post(
  '/payment',
  webhookRateLimiter,
  apiKeyAuth,
  paymentWebhookValidator,
  handleValidationErrors,
  webhookController.paymentCallback
);

module.exports = router;