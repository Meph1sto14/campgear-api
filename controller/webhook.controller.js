const webhookService = require('../service/webhook.service');
const catchAsync = require('../util/catchAsync');

exports.paymentCallback = catchAsync(async (req, res, next) => {
    const { orderId, paymentStatus } = req.body;
    const order = await webhookService.updatePaymentStatus({ orderId, paymentStatus });

    res.status(200).json({
        status: 'success',
        message: `Status pembayaran berhasil diperbarui`,
        data: { order },
    });
});