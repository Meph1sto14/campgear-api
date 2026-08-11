const orderService = require('../service/order.service');
const catchAsync = require('../util/catchAsync');

exports.checkout = catchAsync(async (req, res, next) => {
  const order = await orderService.checkout(req.user._id, req.body);
  res.status(201).json({ status: 'success', data: { order } });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getMyOrders(req.user._id);
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
  res.status(200).json({ status: 'success', data: { order } });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user._id);
  res.status(200).json({ status: 'success', data: { order } });
});