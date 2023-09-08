const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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

module.exports = app;
