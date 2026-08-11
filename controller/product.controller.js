const productService = require('../service/product.service');
const catchAsync = require('../util/catchAsync');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { products, pagination } = await productService.getAllProducts(req.query);
  res.status(200).json({ status: 'success', results: products.length, pagination, data: { products } });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ status: 'success', data: { product } });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await productService.createProduct(req.body, req.user._id);
  res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user._id);
  res.status(200).json({ status: 'success', data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  await productService.deleteProduct(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', message: 'Produk berhasil dihapus (diarsipkan)' });
});