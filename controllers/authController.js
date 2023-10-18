/* eslint-disable prettier/prettier */

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    next(new AppError('Authentication Error', 401));
  }
  // 2) Token Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETE);
  // 3) On Successful verification check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('This user doesnt exist', 401));
  }
  // 4) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // Authenticated user
  req.user = currentUser;
  next();
});

// Selecting Roles -- To Disable roles just remove authController.restrictTo from router
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not an ADMIN', 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this Email', 404));
  }
  // 2) Generate Random Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //Disable validateBeforeSave.

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password  and passwordConfirm to: ${resetURL}\nIf you didn't forget your password , please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token will expire in 10 minutes`,
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email, Try Later', 500),
    );
  }
  res.status(200).json({
    status: 'success',
    message: `Token Sent to mail`,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token received in params
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // select one which password token is not expired
  });

  // 2) If token has not expired and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has Expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // 3) Update the changePasswordAt property for the user
  await user.save();
  // 4) Log the user in , send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password'); // we cannot use findAndUpdate because it wont work for us.

  // 2) Check if Posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If correct, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in , send JWT
  createSendToken(user, 200, res);
});
