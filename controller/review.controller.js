const reviewService = require('../service/review.service');
const catchAsync = require('../util/catchAsync');

exports.getProductReviews = catchAsync(async (req, res, next) => {
  const reviews = await reviewService.getProductReviews(req.params.productId);
  res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.createReview(req.user._id, req.params.productId, req.body);
  res.status(201).json({ status: 'success', data: { review } });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.updateReview(req.params.id, req.user._id, req.body);
  res.status(200).json({ status: 'success', data: { review } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  await reviewService.deleteReview(req.params.id, req.user._id, req.user.role);
  res.status(200).json({ status: 'success', message: 'Review berhasil dihapus' });
});