const Review = require('../models/Review');
const Product = require('../models/Product');
const AppError = require('../util/AppError');

// Hitung ulang ratingAverage & ratingCount produk berdasarkan seluruh review yang ada
async function recalculateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, archived: false } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10, // dibulatkan 1 desimal
      ratingCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { ratingAverage: 0, ratingCount: 0 });
  }
}

async function getProductReviews(productId) {
  return Review.find({ product: productId, archived: false }).populate('user', 'name');
}

async function createReview(userId, productId, { rating, comment }) {
  const product = await Product.findOne({ _id: productId, archived: false });
  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  const existing = await Review.findOne({ product: productId, user: userId });
  if (existing) {
    throw new AppError('Anda sudah memberi ulasan untuk produk ini', 409);
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    comment,
    createdBy: userId,
    updatedBy: userId,
  });

  await recalculateProductRating(productId);
  return review;
}

async function updateReview(reviewId, userId, { rating, comment }) {
  const review = await Review.findById(reviewId);
  if (!review || review.archived) {
    throw new AppError('Review tidak ditemukan', 404);
  }
  if (review.user.toString() !== userId.toString()) {
    throw new AppError('Anda tidak memiliki izin untuk mengubah review ini', 403);
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  review.updatedBy = userId;
  await review.save();

  await recalculateProductRating(review.product);
  return review;
}

async function deleteReview(reviewId, userId, userRole) {
  const review = await Review.findById(reviewId);
  if (!review || review.archived) {
    throw new AppError('Review tidak ditemukan', 404);
  }
  if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('Anda tidak memiliki izin untuk menghapus review ini', 403);
  }

  review.archived = true;
  review.updatedBy = userId;
  await review.save();

  await recalculateProductRating(review.product);
}

module.exports = { getProductReviews, createReview, updateReview, deleteReview };