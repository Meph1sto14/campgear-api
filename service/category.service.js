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

async function getAllCategories() {
  return Category.find({ archived: false });
}

async function createCategory(data, userId) {
  const slug = slugify(data.name);

  const existing = await Category.findOne({ $or: [{ name: data.name }, { slug }] });
  if (existing) {
    throw new AppError('Kategori dengan nama tersebut sudah ada', 409);
  }

  return Category.create({
    ...data,
    slug,
    createdBy: userId,
    updatedBy: userId,
  });
}

async function updateCategory(id, data, userId) {
  const category = await Category.findById(id);
  if (!category || category.archived) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  if (data.name) {
    data.slug = slugify(data.name);
  }

  Object.assign(category, data, { updatedBy: userId });
  await category.save();
  return category;
}

async function deleteCategory(id, userId) {
  const category = await Category.findById(id);
  if (!category || category.archived) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  category.archived = true;
  category.updatedBy = userId;
  await category.save();
  return category;
}

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };