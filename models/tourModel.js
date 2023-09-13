const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//NOTE: When we use this.Price in validator directly then it only works during create, but not update, because it cannot get value of price while updating. For that reason to work both in update and create i have created this function 😋chatGPT
async function priceDiscountValidator(value) {
  try {
    if (this.ownerDocument) {
      // For nested schemas (if applicable)
      return value < this.ownerDocument().price;
    } else {
      // For update operations, find the document first
      const doc = await this.model.findOne({ _id: this._conditions._id });
      if (doc) {
        return value < doc.price;
      }
    }
    // If document is not found or in case of new document creation
    return value < this.price;
  } catch (error) {
    return false;
  }
}

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is Missing,'],
      unique: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration is required (days)'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Maximum Group Size is required.'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
      required: [true, 'A tour must have Difficulty , e.g Easy, Medium, Hard'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: priceDiscountValidator,
        message: `Price Discount of ({VALUE}) should not be more than the price `,
      },
    },
    summary: {
      type: String,
      trim: true, // It will removes all white spaces from start and end will be removed.
      required: [true, 'A Tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    ratingsQuatity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'Price is Missing.'],
    },
    // We are using Query Middleware which will only show non-secrete tours.
    secreteTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
/* How to use VIRTUALS in Models. Here durationWeek will not save in Database but it will show in every get Query*/
tourSchema.virtual('durationWeek').get(function () {
  if (this.duration) {
    return (this.duration / 7).toFixed(2) * 1;
  } else {
    return 0.0;
  }

  // 'this' means taking duration from the this document
});

//Pre DOCUMENT Middleware it runs before .save() .create() document
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // We are going to make slug out of name and keep it lowercase
  next(); // we call next so it can call next middleware in the stack
});

// Post DOCUMENT Middleware
// Note: "this" keyword points to the current doc here.
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// Pre QUERY Middleware
// Note: "this" keyword points to the current query here.
tourSchema.pre(/^find/, function (next) {
  this.find({ secreteTour: { $ne: true } });
  this.start = Date.now();
  next(); // It willnot show secrete tour.
});

// Post QUERY Middleware
tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} ms.`);
  next();
});

// Aggregation Middleware
// Note: "this" keyword points to the current AGGREGATION here.
tourSchema.pre('aggregate', function (next) {
  //Note: Instead of adding match to every aggregation we simple insert "unshift()" into aggregate pipeline using pre.aggregate.middleware
  this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
