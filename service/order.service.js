const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../util/AppError');

const STATUS_FLOW = {
  pending: ['paid', 'cancelled'],
  paid: ['processed', 'cancelled'],
  processed: ['shipped'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
};

async function checkout(userId, { shippingAddress }) {
  if (!shippingAddress) {
    throw new AppError('Alamat pengiriman wajib diisi', 400);
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart kosong, tidak bisa checkout', 400);
  }

  const orderItems = [];
  let totalPrice = 0;

  // Validasi stok & bangun snapshot
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product || product.archived) {
      throw new AppError(`Produk ${item.product.name} sudah tidak tersedia`, 404);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Stok produk "${product.name}" tidak mencukupi`, 409);
    }

    const subtotal = product.price * item.quantity;
    totalPrice += subtotal;

    orderItems.push({
      product: product._id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  // Kurangi stok tiap produk
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalPrice,
    status: 'pending',
    paymentStatus: 'unpaid',
    shippingAddress,
    createdBy: userId,
    updatedBy: userId,
  });

  // Kosongkan cart
  cart.items = [];
  cart.updatedBy = userId;
  await cart.save();

  console.log(`📩 [Notifikasi] Order baru dibuat: ${order._id}, status: pending`);

  return order;
}

async function getMyOrders(userId) {
  return Order.find({ user: userId }).sort('-createdAt');
}

async function getOrderById(orderId, userId, userRole) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order tidak ditemukan', 404);
  }
  if (order.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('Anda tidak memiliki izin untuk melihat order ini', 403);
  }
  return order;
}

async function getAllOrders() {
  return Order.find().populate('user', 'name email').sort('-createdAt');
}

async function updateOrderStatus(orderId, newStatus, userId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order tidak ditemukan', 404);
  }

  const allowedNext = STATUS_FLOW[order.status] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Tidak bisa mengubah status dari '${order.status}' ke '${newStatus}'`,
      400
    );
  }

  // Kalau dibatalkan, kembalikan stok
  if (newStatus === 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  order.status = newStatus;
  order.updatedBy = userId;
  await order.save();

  console.log(`📩 [Notifikasi] Order ${order._id} status berubah jadi: ${newStatus}`);

  return order;
}

module.exports = { checkout, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };