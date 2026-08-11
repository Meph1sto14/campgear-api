function errorHandler(err, req, res, next) {
    err.statusCode = err.statusCode || 500;

    if (err.name === 'ValidationError') {
        err.statusCode = 400;
        err.message = Object.values(err.errors)
            .map((el) => el.message)
            .join(', ');
    }

    if (err.code === 11000) {
        err.statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        err.message = `${field} sudah digunakan. silahkan pakai nilai lain`;
    }

    if (err.name === 'CastError') {
        err.statusCode = 400;
        err.message = `${err.path} tidak valid: ${err.value}`;
    }

    if (err.name === 'JsonWebTokenError') {
        err.statusCode = 401;
        err.message = 'Token tidak valid';
    }

    if (err.name === 'TokenExpiredError') {
        err.statusCode = 401;
        err.message = 'Token sudah kedaluwarsa, silakan login ulang';
    }

    err.status = err.status || (`${err.statusCode}`.startsWith('4') ? 'fail' : 'error');

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
}

module.exports = errorHandler;