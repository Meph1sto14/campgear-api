const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Product = require('../models/Product');
const generateToken = require('../util/generateToken');

async function createUserWithToken(role = 'customer') {
  const user = await User.create({
    name: `Test ${role}`,
    email: `${role}${Date.now()}@mail.com`,
    password: 'password123',
    role,
  });
  const token = generateToken(user._id);
  return { user, token };
}

describe('Webhook Payment API', () => {
  let adminToken, customerToken, categoryId, productId, orderId;

  beforeEach(async () => {
    const admin = await createUserWithToken('admin');
    const customer = await createUserWithToken('customer');
    adminToken = admin.token;
    customerToken = customer.token;

    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Tenda & Shelter' });
    categoryId = catRes.body.data.category._id;

    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Tenda Webhook Test',
        description: 'Produk untuk automated testing webhook',
        price: 500000,
        stock: 3,
        images: ['https://example.com/test.jpg'],
        category: categoryId,
      });
    productId = prodRes.body.data.product._id;

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });

    const checkoutRes = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shippingAddress: 'Jl. Testing Webhook No. 1' });

    orderId = checkoutRes.body.data.order._id;
  });

  it('should reject request without API key (401)', async () => {
    const res = await request(app)
      .post('/api/webhook/payment')
      .send({ orderId, paymentStatus: 'paid' });

    expect(res.statusCode).toBe(401);
  });

  it('should reject request with wrong API key (401)', async () => {
    const res = await request(app)
      .post('/api/webhook/payment')
      .set('x-api-key', 'api-key-yang-salah')
      .send({ orderId, paymentStatus: 'paid' });

    expect(res.statusCode).toBe(401);
  });

  it('should reject invalid paymentStatus value (400)', async () => {
    const res = await request(app)
      .post('/api/webhook/payment')
      .set('x-api-key', process.env.API_KEY_WEBHOOK)
      .send({ orderId, paymentStatus: 'lunas' }); // bukan 'paid' / 'failed'

    expect(res.statusCode).toBe(400);
  });

  it('should mark order as paid when payment succeeds', async () => {
    const res = await request(app)
      .post('/api/webhook/payment')
      .set('x-api-key', process.env.API_KEY_WEBHOOK)
      .send({ orderId, paymentStatus: 'paid' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order.paymentStatus).toBe('paid');
    expect(res.body.data.order.status).toBe('paid');
  });

  it('should cancel order and restore stock when payment fails', async () => {
    const stockBefore = await Product.findById(productId);
    expect(stockBefore.stock).toBe(2); // 3 - 1 setelah checkout di beforeEach

    const res = await request(app)
      .post('/api/webhook/payment')
      .set('x-api-key', process.env.API_KEY_WEBHOOK)
      .send({ orderId, paymentStatus: 'failed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order.paymentStatus).toBe('failed');
    expect(res.body.data.order.status).toBe('cancelled');

    const stockAfter = await Product.findById(productId);
    expect(stockAfter.stock).toBe(3); // stok balik lagi karena payment gagal
  });
});