require('dotenv').config();
const express = require('express');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./route/auth.route');
const cartRoute = require('./route/cart.route');
const categoryRoute = require('./route/category.route');
const productRoute = require('./route/product.route');
const webhookRoute = require('./route/webhook.route');
const reviewRoute = require('./route/review.route');
const orderRoute = require('./route/order.route');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
app.use(express.json());
app.use(logger);


app.get('/', (req, res) => {
  res.json({ message: 'CampGear API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/webhook', webhookRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/orders', orderRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

module.exports = app;