const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is not provided.'],
  },
  email: {
    type: String,
    required: [true, 'Email is Not Provided.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid Email'],
  },

  photo: String,

  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'guide'],
  },

  password: {
    type: String,
    required: [true, 'Password is not provided'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm password is not provided'],

    // This will only work on CREATE & SAVE
    validate: {
      validator: function (e) {
        return e === this.password;
      },
      message: 'Passwords donot match',
    },
  },
  passwordChangedAt: Date,
});

// Note: Password Encryption should be in the Model
// Hash Password
userSchema.pre('save', async function (next) {
  //Only runs if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Note: we donot need passwordConfirm anymore so we delete that field
  this.passwordConfirm = undefined;
  next();
});

//Instance Method: Compare encrypted password with user input password
userSchema.methods.correctPassword = async function (
  candicatePassword,
  userPassword,
) {
  return await bcrypt.compare(candicatePassword, userPassword);
};

//Instance Method: Check if the user changed the password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
