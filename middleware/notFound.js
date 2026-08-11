const AppError = require('../util/AppError');

function notFound(req, res, next) {
    next(new AppError(`Route tidak ditemukan ${req.originalUrl}`, 404));
}

module.exports = notFound;