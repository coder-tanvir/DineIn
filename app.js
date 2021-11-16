//Packages
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const bodyparser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const slug = require('slug');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('express-flash');
//////Initiializing passport/////////////

//Application start
const app = express();
//Application used middlewares:
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use('/uploads', express.static('uploads'));

app.use(
  session({
    secret: 'verygoodsecret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});
app.use(passport.initialize());
app.use(passport.session());
///Templating Engine

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//////////////////////////////////////////////////
///Setting up file uploads with multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    //let ext = path.ext(file.originalname);
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

//////////////////////////////////////////////////////////////
////Database Connection

mongoose
  .connect(process.env.DATABASE_CONNECTION, {
    userNewUrlParser: true,
    userCreateIndex: true,
    userFindAndModify: false,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('DB Connection Successful');
  });

//Server requests and responses
//Landing page and Login
app.get('/', (req, res) => {
  res.render('startingpage');
});

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

app.get('/registration', (req, res) => {
  res.sendFile(__dirname + '/registration.html');
});

app.post('/registration', async (req, res) => {
  console.log(req.body);
  const newuser = await users.create({
    email: req.body.email,
    password: req.body.password,
    //passwordconfirm: req.body.passwordconfirm,
    phonenumber: req.body.phonenumber,
    address: req.body.address,
    city: req.body.city,
  });

  res.redirect('/');
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match user
    users
      .findOne({
        email: email,
      })
      .then((user) => {
        if (!user) {
          res.locals.error = 'Email not found';
          return done(null, false, { message: 'Email not found' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  users.findById(id, function (err, user) {
    done(err, user);
  });
});

//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
//////Login

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/loginnext',
    failureRedirect: '/',
    session: true,
  })
);

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/searchweeklymenu');
};

app.get('/loginnext', ensureAuthenticated, async (req, res) => {
  const user = await users.findById(req.user.id);
  res.render('loginnext');
});

app.get('/updateuserinfo', ensureAuthenticated, async (req, res) => {
  const user = await users.findById(req.user.id);
  console.log('Get request', user);
  res.sendFile(__dirname + '/updateuser.html');
});

app.post('/updateuserinfo', ensureAuthenticated, async (req, res) => {
  const user = await users.findById(req.user.id);
  user.password = req.body.password;
  user.phonenumber = req.body.phonenumber;
  user.address = req.body.address;
  user.city = req.body.city;
  await user.save();
  res.redirect('/');
});

////////////////////////////
//////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
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

app.get('/caterpost', ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/caterpost.html');
});
////CaterPost
//Will need async await for database later
app.post('/caterpost', upload.single('avatar'), async (req, res) => {
  const areainput = req.body.area;
  const arealower = areainput.toLowerCase();
  console.log(req.body);
  const newpost = await weeklyposting.create({
    postedby: req.user.id,
    servicename: req.body.servicename,
    phonenumber: req.body.phonenumber,
    typeoffood: req.body.typeoffood,
    area: arealower,
    numberofmenu: req.body.numberofmenu,
    servicemethod: req.body.servicemethod,
    frequency: req.body.frequency,
    price: req.body.price,
    mondayitem: req.body.mondayitem,
    tuesdayitem: req.body.tuesdayitem,
    wednesdayitem: req.body.wednesdayitem,
    thursdayitem: req.body.thursdayitem,
    fridayitem: req.body.fridayitem,
    saturdayitem: req.body.saturdayitem,
    sundayitem: req.body.sundayitem,
    deals: req.body.deals,
    link: req.body.link,
    avatar: req.file.filename,
    menu2price: req.body.menu2price,
    menu2mondayitem: req.body.menu2mondayitem,
    menu2tuesdayitem: req.body.menu2tuesdayitem,
    menu2wednesdayitem: req.body.menu2wednesdayitem,
    menu2thursdayitem: req.body.menu2thursdayitem,
    menu2fridayitem: req.body.menu2fridayitem,
    menu2saturdayitem: req.body.menu2saturdayitem,
    menu2sundayitem: req.body.menu2sundayitem,
    menu3price: req.body.menu3price,
    menu3mondayitem: req.body.menu3mondayitem,
    menu3tuesdayitem: req.body.menu3tuesdayitem,
    menu3wednesdayitem: req.body.menu3wednesdayitem,
    menu3thursdayitem: req.body.menu3thursdayitem,
    menu3fridayitem: req.body.menu3fridayitem,
    menu3saturdayitem: req.body.menu3saturdayitem,
    menu3sundayitem: req.body.menu3sundayitem,
  });

  newpost.save();
  //db.res.redirect('/');
});

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
//Detailed Menupost
app.get('/menupost', ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/menupost.html');
});

app.post(
  '/menupost',
  ensureAuthenticated,
  upload.single('avatar'),
  async (req, res) => {
    const var2 = req.body.servicename;
    menudata = req.body;
    let appetizerscopy = [];
    let meatscopy = [];
    let dishescopy = [];
    let dessertscopy = [];

    for (let attributename in menudata) {
      if (attributename.includes('appetizer')) {
        appetizerscopy.push(menudata[attributename]);
      } else if (attributename.includes('meat')) {
        meatscopy.push(menudata[attributename]);
      } else if (attributename.includes('dishes')) {
        dishescopy.push(menudata[attributename]);
      } else if (attributename.includes('desserts')) {
        dessertscopy.push(menudata[attributename]);
      }
    }
    const newmenu = await menupost.create({
      servicename: req.body.servicename,
      phonenumber: req.body.phonenumber,
      typeoffood: req.body.typeoffood,
      area: req.body.area,
      frequency: req.body.frequency,
      processingtime: req.body.processingtime,
      servicemethod: req.body.servicemethod,
      avatar: req.file.filename,
      appetizers: appetizerscopy,
      meats: meatscopy,
      dishes: dishescopy,
      desserts: dessertscopy,
    });
  }
);
////////
////////////////Menu services rendering///////////////
app.get('/menuoverview', ensureAuthenticated, async (req, res) => {
  const menus = await menupost.find();

  res.render('menuoverview', {
    menus,
  });
});

/////////////Show one menu/////////////
app.get('/menuoverview/:servicename', async (req, res) => {
  const menuone = await menupost.findOne({
    servicename: req.params.servicename,
  });
  res.render('menudetails', {
    menuone,
  });
});

/////////////////////////////////////////////////////
/////Weekly Services Rendering

app.get('/showweeklymenus', ensureAuthenticated, async (req, res) => {
  const menus = await weeklyposting.find();

  res.render('weeklymenus', {
    menus,
  });
});

//Showing the Details Of weekly menu
app.get('/caterpost/:servicename', async (req, res) => {
  const caterpostone = await weeklyposting.findOne({
    servicename: req.params.servicename,
  });
  res.render('weeklyonedetails', {
    caterpostone,
  });
});

////////////Updateing weekly menu

app.get('/updateweeklypost', ensureAuthenticated, async (req, res) => {
  const user = req.user.id;
  const updatepost = await weeklyposting.findOne({ postedby: user });

  console.log(updatepost.servicename);
  res.render('updateweekly', {
    updatepost,
  });
});

app.post('/updateweeklymenu', ensureAuthenticated, async (req, res) => {
  console.log('/////////////////////////////////////////////////////////////');
  console.log(req.body);
  const areainput = req.body.area;
  const arealower = areainput.toLowerCase();
  const user = req.user.id;
  const post = await weeklyposting.findOne({ postedby: user });
  post.servicename = req.body.servicename;
  post.phonenumber = req.body.phonenumber;
  post.typeoffood = req.body.typeoffood;
  post.area = req.body.arealower;
  post.numberofmenu = req.body.numberofmenu;
  post.servicemethod = req.body.servicemethod;
  post.frequency = req.body.frequency;
  post.price = req.body.price;
  post.mondayitem = req.body.mondayitem;
  post.tuesdayitem = req.body.tuesdayitem;
  post.wednesdayitem = req.body.wednesdayitem;
  post.thursdayitem = req.body.thursdayitem;
  post.fridayitem = req.body.fridayitem;
  post.saturdayitem = req.body.saturdayitem;
  post.sundayitem = req.body.sundayitem;
  post.deals = req.body.deals;
  post.link = req.body.link;
  //post.avatar = req.file.filename;
  post.menu2price = req.body.menu2price;
  post.menu2mondayitem = req.body.menu2mondayitem;
  post.menu2tuesdayitem = req.body.menu2tuesdayitem;
  post.menu2wednesdayitem = req.body.menu2wednesdayitem;
  post.menu2thursdayitem = req.body.menu2thursdayitem;
  post.menu2fridayitem = req.body.menu2fridayitem;
  post.menu2saturdayitem = req.body.menu2saturdayitem;
  post.menu2sundayitem = req.body.menu2sundayitem;
  post.menu3price = req.body.menu3price;
  post.menu3mondayitem = req.body.menu3mondayitem;
  post.menu3tuesdayitem = req.body.menu3tuesdayitem;
  post.menu3wednesdayitem = req.body.menu3wednesdayitem;
  post.menu3thursdayitem = req.body.menu3thursdayitem;
  post.menu3fridayitem = req.body.menu3fridayitem;
  post.menu3saturdayitem = req.body.menu3saturdayitem;
  post.menu3sundayitem = req.body.menu3sundayitem;
  await post.save();
  res.redirect('/showweeklymenus');
});
//////////////////////////////////
///Adding searchbar
app.get('/searchweeklymenu', ensureAuthenticated, async (req, res) => {
  const menus = await weeklyposting.find();
  res.render('searchweekly', {
    menus,
  });
});

app.post('/searchweeklymenu', ensureAuthenticated, async (req, res) => {
  console.log(req.body.searchbar);
  const input = req.body.searchbar;
  const inputlower = input.toLowerCase();
  const inputupper = input.toUpperCase();
  console.log(inputupper);
  const inputcopy = input;
  const firstletter = inputcopy.charAt(0);
  const firstletterupper = firstletter.toUpperCase();
  const rest = inputcopy.slice(1);
  const finalresult = firstletterupper + rest;
  console.log(finalresult);
  const menus = await weeklyposting.find({
    $or: [
      { area: { $regex: input } },
      { area: { $regex: inputlower } },
      { area: { $regex: inputupper } },
      { area: { $regex: finalresult } },
    ],
  });
  res.render('searchweekly', {
    menus,
  });
});

////About page
//////
app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/about.html');
});

///////////////////////////////
//Server of the application
const port = 8080;
const server = app.listen(port, () => {
  console.log(`App running on port number ${port}...`);
});
