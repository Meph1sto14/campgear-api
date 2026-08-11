const rateLimit = require('express-rate-limit');

const webhookRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // jendela waktu: 1 menit
  max: 20, // maksimal 20 request per menit per IP
  standardHeaders: true, // kirim info limit di header RateLimit-*
  legacyHeaders: false, // matikan header X-RateLimit-* versi lama
  handler: (req, res) => {
    res.status(429).json({
      status: 'fail',
      message: 'Terlalu banyak request ke endpoint webhook, coba lagi beberapa saat lagi',
    });
  },
});

module.exports = webhookRateLimiter;