const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../util/AppError');

async function updatePaymentStatus({ orderId, paymentStatus }) {
    const validStatuses = ['paid', 'failed'];

    if (!validStatuses.includes(paymentStatus)) {
        throw new AppError('paymentStatus harus salah satu dari: paid, failed', 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError('Order tidak ditemukan', 404);
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
        order.status = 'paid';
    } else if (paymentStatus === 'failed') {
        order.status = 'cancelled';

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
    }
    await order.save();

    console.log(`📩 [Notifikasi] Order ${order._id} status berubah jadi: ${order.status}`);

    return order;
}

module.exports = { updatePaymentStatus };