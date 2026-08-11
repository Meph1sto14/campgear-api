const mongoose = require('mongoose');
const applyCommonFields = require('../util/applyCommonFields');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },   // snapshot
    price: { type: Number, required: true, min: 0 }, // snapshot
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processed', 'shipped', 'completed', 'cancelled'],
    default: 'pending',
  },
  shippingAddress: { type: String, required: true },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed'], default: 'unpaid' },
});

applyCommonFields(orderSchema);

module.exports = mongoose.model('Order', orderSchema);