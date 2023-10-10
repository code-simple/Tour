const AppError = require('../utils/appError');

const handleJwtError = (err) => new AppError('Invalid Token, Login again', 401);
const handleJwtExpire = (err) => new AppError('Token has been expired', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const { keyValue } = err;
  const key = Object.keys(keyValue)[0];
  const value = keyValue[key];

  const message = `Duplicate field value: ${key} - ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError' || error.kind === 'ObjectId')
      error = handleCastErrorDB(error);

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJwtError(error);
    }
    if (error._message && error._message.includes('Validation failed')) {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJwtExpire(error);
    }
    sendErrorProd(error, res);
  }
};
