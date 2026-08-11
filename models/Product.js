const mongoose = require('mongoose');
const applyCommonFields = require('../util/applyCommonFields');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
});

// mendukung fitur search pada endpoint daftar produk
productSchema.index({ name: 'text', description: 'text' });

applyCommonFields(productSchema);

module.exports = mongoose.model('Product', productSchema);