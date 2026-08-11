const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampGear API',
      version: '1.0.0',
      description: 'REST API untuk toko online perlengkapan camping & outdoor (CampGear)',
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Local server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./route/*.js'], // baca komentar JSDoc dari semua file di folder route
};

module.exports = swaggerJsdoc(options);