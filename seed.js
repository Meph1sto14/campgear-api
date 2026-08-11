require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const categoryService = require('./service/category.service');
const productService = require('./service/product.service');

const categoriesData = [
  { name: 'Tenda & Shelter', description: 'Tenda, flysheet, dan perlengkapan naungan untuk berkemah.' },
  { name: 'Sleeping Gear', description: 'Sleeping bag, matras, dan bantal lipat untuk tidur di alam terbuka.' },
  { name: 'Peralatan Masak', description: 'Kompor portable, nesting, dan perlengkapan masak outdoor lainnya.' },
  { name: 'Tas & Carrier', description: 'Tas gunung, daypack, dan dry bag untuk membawa perlengkapan.' },
];

const productsByCategory = {
  'Tenda & Shelter': [
    { name: 'Tenda Dome 4 Orang', description: 'Tenda dome kapasitas 4 orang, waterproof, cocok untuk pendakian.', price: 850000, stock: 15, images: ['https://picsum.photos/seed/tenda1/600/400'] },
    { name: 'Tenda Ultralight 2 Orang', description: 'Tenda ringan 1.8kg, ideal untuk hiking jarak jauh.', price: 1200000, stock: 10, images: ['https://picsum.photos/seed/tenda2/600/400'] },
    { name: 'Flysheet Multifungsi 3x3m', description: 'Flysheet tahan air untuk naungan tambahan atau tenda darurat.', price: 275000, stock: 25, images: ['https://picsum.photos/seed/tenda3/600/400'] },
    { name: 'Tenda Tunnel 6 Orang', description: 'Tenda keluarga kapasitas besar dengan ruang dalam luas.', price: 1750000, stock: 8, images: ['https://picsum.photos/seed/tenda4/600/400'] },
    { name: 'Pasak Tenda Set (10 pcs)', description: 'Set pasak alumunium anti karat untuk berbagai jenis tenda.', price: 65000, stock: 40, images: ['https://picsum.photos/seed/tenda5/600/400'] },
  ],
  'Sleeping Gear': [
    { name: 'Sleeping Bag Suhu -5°C', description: 'Sleeping bag untuk cuaca dingin ekstrem, bahan polyester tebal.', price: 420000, stock: 20, images: ['https://picsum.photos/seed/sleep1/600/400'] },
    { name: 'Matras Angin Portable', description: 'Matras tiup ringkas dengan pompa manual bawaan.', price: 180000, stock: 30, images: ['https://picsum.photos/seed/sleep2/600/400'] },
    { name: 'Matras Lipat Alumunium', description: 'Matras lipat ringan dengan lapisan alumunium foil anti dingin.', price: 95000, stock: 35, images: ['https://picsum.photos/seed/sleep3/600/400'] },
    { name: 'Bantal Lipat Outdoor', description: 'Bantal angin ringkas untuk kenyamanan tidur di tenda.', price: 55000, stock: 45, images: ['https://picsum.photos/seed/sleep4/600/400'] },
    { name: 'Sleeping Bag Compact 3 Musim', description: 'Sleeping bag serbaguna untuk 3 musim, mudah dikompres.', price: 350000, stock: 18, images: ['https://picsum.photos/seed/sleep5/600/400'] },
  ],
  'Peralatan Masak': [
    { name: 'Kompor Portable Butane', description: 'Kompor lipat ringan dengan sistem pengapian otomatis.', price: 150000, stock: 25, images: ['https://picsum.photos/seed/masak1/600/400'] },
    { name: 'Nesting Cook Set 6 in 1', description: 'Set panci dan alat masak susun untuk hiking, ringan dan compact.', price: 220000, stock: 20, images: ['https://picsum.photos/seed/masak2/600/400'] },
    { name: 'Kompor Kayu Portable', description: 'Kompor kayu ringkas tanpa perlu gas, ramah lingkungan.', price: 135000, stock: 15, images: ['https://picsum.photos/seed/masak3/600/400'] },
    { name: 'Tabung Gas Kaleng 220g', description: 'Tabung gas butane untuk kompor portable, sekali pakai.', price: 28000, stock: 60, images: ['https://picsum.photos/seed/masak4/600/400'] },
    { name: 'Peralatan Makan Lipat Titanium', description: 'Set sendok, garpu, dan sumpit titanium anti karat, super ringan.', price: 95000, stock: 30, images: ['https://picsum.photos/seed/masak5/600/400'] },
  ],
  'Tas & Carrier': [
    { name: 'Carrier 60L', description: 'Tas carrier kapasitas besar dengan rangka internal, cocok pendakian panjang.', price: 950000, stock: 12, images: ['https://picsum.photos/seed/tas1/600/400'] },
    { name: 'Daypack 25L', description: 'Tas harian ringkas dengan banyak kompartemen untuk hiking singkat.', price: 320000, stock: 25, images: ['https://picsum.photos/seed/tas2/600/400'] },
    { name: 'Dry Bag 15L', description: 'Tas kedap air untuk melindungi barang elektronik dari basah.', price: 85000, stock: 40, images: ['https://picsum.photos/seed/tas3/600/400'] },
    { name: 'Carrier 40L', description: 'Tas carrier ukuran sedang, pas untuk trip 2-3 hari.', price: 650000, stock: 15, images: ['https://picsum.photos/seed/tas4/600/400'] },
    { name: 'Rain Cover Tas Universal', description: 'Cover anti hujan untuk melindungi carrier/daypack dari basah.', price: 45000, stock: 50, images: ['https://picsum.photos/seed/tas5/600/400'] },
  ],
};

async function getOrCreateAdmin() {
  let admin = await User.findOne({ email: 'admin@campgear.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin CampGear',
      email: 'admin@campgear.com',
      password: 'admin12345',
      role: 'admin',
    });
    console.log('✅ Admin seed dibuat -> email: admin@campgear.com | password: admin12345');
  } else {
    console.log('ℹ️  Admin seed sudah ada, pakai yang lama');
  }
  return admin;
}

async function seedCategories(adminId) {
  const created = {};
  for (const catData of categoriesData) {
    try {
      const category = await categoryService.createCategory(catData, adminId);
      created[category.name] = category;
      console.log(`✅ Kategori dibuat: ${category.name}`);
    } catch (err) {
      // kalau sudah ada (409), ambil yang lama biar script bisa dijalankan berkali-kali
      const Category = require('./models/Category');
      const existing = await Category.findOne({ name: catData.name });
      created[catData.name] = existing;
      console.log(`ℹ️  Kategori sudah ada, dilewati: ${catData.name}`);
    }
  }
  return created;
}

async function seedProducts(categories, adminId) {
  for (const [categoryName, products] of Object.entries(productsByCategory)) {
    const category = categories[categoryName];
    if (!category) continue;

    for (const productData of products) {
      try {
        await productService.createProduct({ ...productData, category: category._id }, adminId);
        console.log(`  ✅ Produk dibuat: ${productData.name}`);
      } catch (err) {
        console.log(`  ℹ️  Produk sudah ada, dilewati: ${productData.name}`);
      }
    }
  }
}

async function run() {
  await connectDB();

  const admin = await getOrCreateAdmin();
  const categories = await seedCategories(admin._id);
  await seedProducts(categories, admin._id);

  console.log('🎉 Seeding selesai!');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seeding gagal:', err);
  process.exit(1);
});