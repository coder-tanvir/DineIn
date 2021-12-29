const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//////
/////User schema
const userschema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'A user must need an email'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Every user must have a password'],
    minlength: 6,
  },
  phonenumber: {
    type: String,
    required: [true, 'We need the users numbers'],
  },
  address: {
    type: String,
    required: [true, 'Cannot deliver without an address'],
  },
  city: {
    type: String,
    required: [true, 'Need City name to filter services'],
  },
  weeklypost: {
    type: mongoose.Schema.ObjectId,
    ref: 'weeklypostings',
  },
});

userschema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userschema.methods.correctpassword = async function (
  candidatepassword,
  userpassword
) {
  console.log(candidatepassword, userpassword);
  return await bcrypt.compare(candidatepassword, userpassword);
};

const users = mongoose.model('users', userschema);

module.exports = users;
