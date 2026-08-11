const AppError = require('../util/AppError');

function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.API_KEY_WEBHOOK) {
        return next(new AppError('API Key tidak valid atau tidak ditemukan', 401));
    }
    next();
}

module.exports = apiKeyAuth;