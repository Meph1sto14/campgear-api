const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../util/AppError');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function getAllProducts(queryParams) {
  const { category, minPrice, maxPrice, search, sort, page = 1, limit = 10 } = queryParams;

  const filter = { archived: false };

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  let sortOption = '-createdAt'; // default: terbaru dulu
  if (sort) {
    // contoh input: "price" atau "-price"
    sortOption = sort.split(',').join(' ');
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getProductById(id) {
  const product = await Product.findOne({ _id: id, archived: false }).populate('category', 'name slug');
  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }
  return product;
}

async function createProduct(data, userId) {
  const category = await Category.findOne({ _id: data.category, archived: false });
  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  const slug = slugify(data.name);
  const existing = await Product.findOne({ slug });
  if (existing) {
    throw new AppError('Produk dengan nama tersebut sudah ada', 409);
  }

  return Product.create({
    ...data,
    slug,
    createdBy: userId,
    updatedBy: userId,
  });
}

async function updateProduct(id, data, userId) {
  const product = await Product.findById(id);
  if (!product || product.archived) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  if (data.category) {
    const category = await Category.findOne({ _id: data.category, archived: false });
    if (!category) {
      throw new AppError('Kategori tidak ditemukan', 404);
    }
  }

  if (data.name) {
    data.slug = slugify(data.name);
  }

  Object.assign(product, data, { updatedBy: userId });
  await product.save();
  return product;
}

async function deleteProduct(id, userId) {
  const product = await Product.findById(id);
  if (!product || product.archived) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  product.archived = true;
  product.updatedBy = userId;
  await product.save();
  return product;
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };