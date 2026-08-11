const mongoose = require('mongoose');
const applyCommonFields = require('../util/applyCommonFields');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
});

applyCommonFields(categorySchema);

module.exports = mongoose.model('Category', categorySchema);