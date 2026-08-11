const cartService = require('../service/cart.service');
const catchAsync = require('../util/catchAsync');

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await cartService.getCart(req.user._id);
  res.status(200).json({ status: 'success', data: { cart } });
});

exports.addItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItem(req.user._id, { productId, quantity });
  res.status(201).json({ status: 'success', data: { cart } });
});

exports.updateItemQuantity = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await cartService.updateItemQuantity(req.user._id, req.params.productId, quantity);
  res.status(200).json({ status: 'success', data: { cart } });
});

exports.removeItem = catchAsync(async (req, res, next) => {
  const cart = await cartService.removeItem(req.user._id, req.params.productId);
  res.status(200).json({ status: 'success', data: { cart } });
});