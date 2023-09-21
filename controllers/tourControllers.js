// const Tour = require('../models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// // Perfect example of aliasing & how to use Middleware
// exports.aliasTopTours = async (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = 'price,-ratingsAverage';
//   req.query.fields = 'name,price,ratingsAverage,difficulty';
//   next();
// };

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;

//   res.status(200).json({
//     status: 'Success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with this ID', 400));
//   }
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'Success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
// // Remmeber we are doing PATCH request here , as in model we set this function for patch and not PUT, PUT will modify the whole object
// //e.g if we send PUT price :400 then everything will go away and only price property will remain.
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true, // NOTE: Validators means = Validators in Tour Model, e.g minLenght, maxLength,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with this ID', 400));
//   }
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       tour,
//     },
//   });
// });
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const deleteTour = await Tour.findByIdAndDelete(req.params.id);

//   if (!deleteTour) {
//     return next(new AppError('No tour found with this ID', 400));
//   }
//   res.status(200).json({
//     status: 'Success',
//     deleteTour,
//   });
// });

// exports.getTourStats = catchAsync(async (req, res, next) => {
//   const stats = await Tour.aggregate([
//     // {
//     //   $match: { ratingsAverage: { $gt: 4.7 } },
//     // },
//     {
//       $group: {
//         _id: { $toUpper: '$difficulty' },
//         // _id: null,
//         numTours: { $sum: 1 },
//         numRatings: { $sum: '$ratingsQuatity' },
//         avgRatings: { $avg: '$ratingsAverage' },
//         avgPrice: { $avg: '$price' },
//         maxPrice: { $max: '$price' },
//         minPrice: { $min: '$price' },
//       },
//     },
//     {
//       $sort: { avgPrice: 1 },
//     },
//   ]);
//   res.status(200).json({
//     status: 'Success',
//     stats,
//   });
// });

// exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
//   const year = req.params.year * 1;
//   const plan = await Tour.aggregate([
//     {
//       $unwind: '$startDates',
//     },
//     {
//       $match: {
//         startDates: {
//           $gte: new Date(`${year}-1-1`),
//           $lte: new Date(`${year}-12-31`),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: { $month: '$startDates' },
//         numToursStarts: { $sum: 1 },
//         tours: { $push: '$name' },
//       },
//     },
//     {
//       $addFields: { month: '$_id' },
//     },
//     {
//       $project: { _id: 0 },
//     },
//     {
//       $sort: {
//         numToursStarts: -1,
//       },
//     },
//   ]);

//   res.status(200).json({
//     results: plan.length,
//     status: 'Success',
//     plan,
//   });
// });

const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({ _id: req.params.id })

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
