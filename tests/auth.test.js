const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jest User',
      email: 'jestuser@mail.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  it('should fail register with invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jest User',
      email: 'invalidemail',
      password: 'password123',
    });

    expect(res.statusCode).toBe(400);
  });

  it('should login successfully with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jest Login',
      email: 'jestlogin@mail.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'jestlogin@mail.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jest Wrong',
      email: 'jestwrong@mail.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'jestwrong@mail.com',
      password: 'salahpassword',
    });

    expect(res.statusCode).toBe(401);
  });

  it('should fail accessing protected route with invalid token (401, not 500)', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', 'Bearer token.ngasal.banget');

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  it('should fail accessing protected route without token at all', async () => {
    const res = await request(app).get('/api/orders');

    expect(res.statusCode).toBe(401);
  });
});