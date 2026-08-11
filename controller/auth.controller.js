const authService = require('../service/auth.service');
const catchAsync = require('../util/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { user, token } = await authService.login(req.body);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    },
  });
});