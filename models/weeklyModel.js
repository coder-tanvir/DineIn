const mongoose = require('mongoose');
////////Weekly catering post
///Weekly caterpost schema
const weeklycateringschema = new mongoose.Schema({
  servicename: {
    type: String,
    required: [true, 'A service must have a name'],
  },
  phonenumber: {
    type: String,
    required: [true, 'A Service must have a number'],
  },
  typeoffood: {
    type: String,
    required: [true, 'A service must have a cuisine type'],
  },
  numberofmenu: {
    type: String,
    required: [true, 'Should have total number of weekly menus'],
  },
  area: {
    type: String,
    required: [true, 'A service should specify area covered by it'],
  },
  servicemethod: {
    type: String,
    required: [true, 'Choose how the service is provided'],
  },
  frequency: {
    type: String,
    required: [true, 'How many pickups or delivery will be in a week'],
  },
  deals: {
    type: String,
  },
  link: {
    type: String,
  },
  price: {
    type: String,
    required: [true, 'must include price'],
  },
  mondayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  tuesdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  wednesdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  thursdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  fridayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  saturdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  sundayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },

  menu2price: {
    type: String,
    required: [false, 'IF U have a menu then pls include price'],
  },
  menu2mondayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu2tuesdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu2wednesdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu2thursdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu2fridayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu2saturdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu2sundayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu3price: {
    type: String,
    required: [false, 'If u ......  must include price'],
  },
  menu3mondayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu3tuesdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu3wednesdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu3thursdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu3fridayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu3saturdayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  menu3sundayitem: {
    type: String,
    required: [false, 'There may be any item in Monday or not'],
  },
  avatar: {
    type: String,
  },
  postedby: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'Every service is posted by someone'],
  },
});

const weeklyposting = mongoose.model('weeklyposting', weeklycateringschema);

module.exports = weeklyposting;
