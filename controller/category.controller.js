const categoryService = require('../service/category.service');
const catchAsync = require('../util/catchAsync');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({ status: 'success', results: categories.length, data: { categories } });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.createCategory(req.body, req.user._id);
  res.status(201).json({ status: 'success', data: { category } });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.user._id);
  res.status(200).json({ status: 'success', data: { category } });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  await categoryService.deleteCategory(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', message: 'Kategori berhasil dihapus (diarsipkan)' });
});