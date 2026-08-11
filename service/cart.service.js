const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../util/AppError');

// Ambil cart milik user, buat baru kalau belum ada
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], createdBy: userId, updatedBy: userId });
  }
  return cart;
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  await cart.populate('items.product', 'name price stock images slug');
  return cart;
}

async function addItem(userId, { productId, quantity }) {
  if (!quantity || quantity < 1) {
    throw new AppError('Jumlah (quantity) minimal 1', 400);
  }

  const product = await Product.findOne({ _id: productId, archived: false });
  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }
  if (product.stock < quantity) {
    throw new AppError('Stok produk tidak mencukupi', 409);
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  cart.updatedBy = userId;
  await cart.save();
  await cart.populate('items.product', 'name price stock images slug');
  return cart;
}

async function updateItemQuantity(userId, productId, quantity) {
  if (!quantity || quantity < 1) {
    throw new AppError('Jumlah (quantity) minimal 1', 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }
  if (product.stock < quantity) {
    throw new AppError('Stok produk tidak mencukupi', 409);
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    throw new AppError('Produk tidak ada di dalam cart', 404);
  }

  item.quantity = quantity;
  cart.updatedBy = userId;
  await cart.save();
  await cart.populate('items.product', 'name price stock images slug');
  return cart;
}

async function removeItem(userId, productId) {
  const cart = await getOrCreateCart(userId);

  const itemExists = cart.items.some((item) => item.product.toString() === productId);
  if (!itemExists) {
    throw new AppError('Produk tidak ada di dalam cart', 404);
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  cart.updatedBy = userId;
  await cart.save();
  await cart.populate('items.product', 'name price stock images slug');
  return cart;
}

module.exports = { getCart, addItem, updateItemQuantity, removeItem };