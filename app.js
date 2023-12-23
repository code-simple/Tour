const express = require('express');
const morgan = require('morgan');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const { join } = require('node:path');
const helmet = require('helmet');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHanlder = require('./controllers/errorController');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
// Global Middlewares

// Set Security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(':date[clf] ":method :url"'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests form this IP please try again in an hour',
});

// Set limit req from same API
app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanatization against NoSQL query injection
app.use(mongoSanitize());

//Data sanatization against XSS
app.use(xss());

// Hosting files in public folder
app.use(express.static(`${__dirname}/public`));

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// This middleweare we can use requestTime
app.use((req, res, next) => {
  req.requestTime = `Req Timestamp: ${new Date().toDateString()}`;
  next();
});

// 3) Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.get('/chat', (req, res) => {
  res.sendFile(join(__dirname, '/index.html'));
});

// Route Error handling
//NOTE: whenever there is next(err) that will always jump to globalErrorHandler as it has (err,) in it.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHanlder);

module.exports = app;
