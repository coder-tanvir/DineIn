const mongoose = require('mongoose');
//////////////////////////////////////////////
///Menu Post Schema
const menupostschema = mongoose.Schema({
  servicename: {
    type: String,
    required: [true, 'A service must have a name'],
  },
  phonenumber: {
    type: String,
    required: [true, 'A service must have a phonenumber'],
  },
  typeoffood: {
    type: String,
    required: [true, 'A service must have a cuisine type'],
  },
  servicemethod: {
    type: String,
    required: [true, 'A Business must have service method'],
  },
  processingtime: {
    type: String,
    required: [true, 'Specify processing time for more views'],
  },
  area: {
    type: String,
    required: [true, 'A service must have a name'],
  },
  frequency: {
    type: String,
    required: [true, 'A service must have a name'],
  },
  avatar: {
    type: String,
  },
  appetizers: [String],
  meats: [String],
  dishes: [String],
  desserts: [String],
});
const menupost = mongoose.model('menupost', menupostschema);

module.exports = menupost;
