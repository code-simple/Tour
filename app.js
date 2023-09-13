const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHanlder = require('./controllers/errorController');
const app = express();

// Morgan Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
// Hosting files in public folder
app.use(express.static(`${__dirname}/public`));

// This middleweare we can use requestTime
app.use((req, res, next) => {
  req.requestTime = `Request Time: ${new Date().toDateString()}`;
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
