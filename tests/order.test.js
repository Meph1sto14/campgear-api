const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const generateToken = require('../util/generateToken');

// Helper: buat user + token langsung lewat model, tanpa lewat endpoint (lebih cepat untuk setup test)
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

describe('Order & Checkout API', () => {
    let adminToken, customerToken, categoryId, productId;

    beforeEach(async () => {
        const admin = await createUserWithToken('admin');
        const customer = await createUserWithToken('customer');
        adminToken = admin.token;
        customerToken = customer.token;

        // Admin bikin kategori
        const catRes = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Tenda & Shelter' });
        categoryId = catRes.body.data.category._id;

        // Admin bikin produk dengan stok terbatas (2 unit)
        const prodRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Tenda Test Jest',
                description: 'Produk untuk automated testing',
                price: 500000,
                stock: 2,
                images: ['https://example.com/test.jpg'],
                category: categoryId,
            });
        productId = prodRes.body.data.product._id;
    });

    it('should checkout successfully and reduce stock', async () => {
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 1 });

        const checkoutRes = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shippingAddress: 'Jl. Testing No. 1' });

        expect(checkoutRes.statusCode).toBe(201);
        expect(checkoutRes.body.data.order.status).toBe('pending');
        expect(checkoutRes.body.data.order.totalPrice).toBe(500000);
        // Snapshot check
        expect(checkoutRes.body.data.order.items[0].productName).toBe('Tenda Test Jest');

        const productRes = await request(app).get(`/api/products/${productId}`);
        expect(productRes.body.data.product.stock).toBe(1); // 2 - 1
    });

    it('should fail checkout when stock is insufficient (409)', async () => {
        const Product = require('../models/Product');

        // Tambah item ke cart sesuai stok yang masih tersedia (berhasil)
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 2 });

        // Simulasikan stok berkurang di database SETELAH item masuk cart
        // (misal: dibeli user lain lebih dulu)
        await Product.findByIdAndUpdate(productId, { stock: 0 });

        const checkoutRes = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shippingAddress: 'Jl. Testing No. 1' });

        expect(checkoutRes.statusCode).toBe(409);
        expect(checkoutRes.body.status).toBe('fail');
    });

    it('should fail checkout when cart is empty', async () => {
        const checkoutRes = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shippingAddress: 'Jl. Testing No. 1' });

        expect(checkoutRes.statusCode).toBe(400);
    });

    it('should fail checkout without shippingAddress (validator)', async () => {
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 1 });

        const checkoutRes = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({});

        expect(checkoutRes.statusCode).toBe(400);
    });

    it('admin should be able to update order status', async () => {
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 1 });

        const checkoutRes = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shippingAddress: 'Jl. Testing No. 1' });

        const orderId = checkoutRes.body.data.order._id;

        const statusRes = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'paid' });

        expect(statusRes.statusCode).toBe(200);
        expect(statusRes.body.data.order.status).toBe('paid');
    });
});