const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHanlder = require('./controllers/errorController');

const app = express();
// Global Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(':date[clf] ":method :url"'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests form this IP please try again in an hour',
});

app.use('/api', limiter);

app.use(express.json());
// Hosting files in public folder
app.use(express.static(`${__dirname}/public`));

// This middleweare we can use requestTime
app.use((req, res, next) => {
  req.requestTime = `Req Timestamp: ${new Date().toDateString()}`;
  next();
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Route Error handling
//NOTE: whenever there is next(err) that will always jump to globalErrorHandler as it has (err,) in it.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHanlder);

module.exports = app;
