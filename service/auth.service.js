const User = require('../models/User');
const AppError = require('../util/AppError');
const generateToken = require('../util/generateToken');

async function register({ name, email, password, phone }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email sudah terdaftar', 409);
    }

    const newUser = await User.create({ name, email, password, phone });
    
    const token = generateToken(newUser._id);
    return { user: newUser, token };
}

async function login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Email atau password salah', 401);
    }

    const token = generateToken(user._id);
    return { user, token };
}

module.exports = {
    register,
    login,
};