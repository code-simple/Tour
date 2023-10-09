const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  //Note: The above Method of creating user has flaw, everyone can be admin or have their own roles. We won't accepts roles
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email/password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) Check if user exists & password is correct
  // As we dont have password in response so we explicitly select password from query by adding .select("+passwrd")
  const user = await User.findOne({ email }).select('+password');

  //Use Instance Method "correctPassword" that we created in userModel
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  // 3) If everything ok, Send the token
  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token,
  });
});
