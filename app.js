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

//Application start
const app = express();
//Application used middlewares:
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use('/uploads', express.static('uploads'));
//Passport helper functions
app.use(
  session({
    secret: 'verygoodsecret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
//////////////////////////////////////////////////////////////////////////////////////
//Global Vars
global.count = 0;
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  console.log('Its here');
  console.log(res.locals.error);
  next();
});
app.use(passport.initialize());
app.use(passport.session());
////////////////////////////////////////////////////////////////////////////////////////
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

const weeklyposting = require('./models/weeklyModel');
const menupost = require('./models/menuModel');
const users = require('./models/usersModel');
///////////////////////////////////////Server requests and responses
//Landing page and Login
app.get('/', (req, res) => {
  count = count + 1;
  console.log(count);
  let error24;
  if (res.locals.error != '') {
    error24 = 'Incorrect Credentials';
  } else {
    error24 = '';
  }
  res.render('startingpage', {
    error24,
    count,
  });
});
///////////////////////////////////////////////////////////////////////////////////////
/////////////////Registration
app.get('/registration', (req, res) => {
  res.sendFile(__dirname + '/views/registration.html');
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
          return done(null, false, { message: 'Email not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incoreect Password' });
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

app.post('/login', (req, res, next) =>
  passport.authenticate('local', {
    successRedirect: '/loginnext',
    failureRedirect: '/',
    session: true,
    failureFlash: true,
  })(req, res, next)
);

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

////////////////////////////////////////////////////
//////////////Page of all Links
app.get('/loginnext', ensureAuthenticated, async (req, res) => {
  const user = await users.findById(req.user.id);
  res.render('loginnext');
});
/////////////////////////////////////////////////////
//////////Update user info
app.get('/updateuserinfo', ensureAuthenticated, async (req, res) => {
  const user = await users.findById(req.user.id);
  console.log('Get request', user);
  res.sendFile(__dirname + '/views/updateuser.html');
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
//////////////////Weekly Menu Post/////////////////////////////

app.get('/caterpost', ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/views/caterpost.html');
});

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
  res.redirect('/searchweeklymenu');
});

app.get('/caterpost/:servicename', async (req, res) => {
  const caterpostone = await weeklyposting.findOne({
    servicename: req.params.servicename,
  });
  res.render('weeklyonedetails', {
    caterpostone,
  });
});

////////////Update weekly post////////////
app.get('/updateweeklypost', ensureAuthenticated, async (req, res) => {
  const user = req.user.id;
  const updatepost = await weeklyposting.findOne({ postedby: user });

  console.log(updatepost.servicename);
  res.render('updateweekly', {
    updatepost,
  });
});

/////////////Searching weekly menu////////
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

/////////////////Changing to update//////////////
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

///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Menupost ////////////////////////////////////////////
app.get('/menupost', ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/views/menupost.html');
});

//////////////////////////////////////////////////
/////////Saving menu post
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
    res.redirect('/searchmenu');
  }
);

/////////////Details of one menu/////////////
app.get('/menuoverview/:servicename', async (req, res) => {
  const menuone = await menupost.findOne({
    servicename: req.params.servicename,
  });
  res.render('menudetails', {
    menuone,
  });
});

///////////////Searching Menu/////////////////////////////////////

app.get('/searchmenu', ensureAuthenticated, async (req, res) => {
  const menus = await menupost.find();
  res.render('searchmenu.pug', {
    menus,
  });
});

app.post('/searchmenu', ensureAuthenticated, async (req, res) => {
  const searchterm = req.body.searchbar;
  console.log(searchterm);
  const input = searchterm;
  const inputlower = input.toLowerCase();
  const inputupper = input.toUpperCase();
  const firstchar = input.charAt(0);
  const lastpart = input.slice(1);
  const firstupper = firstchar.toUpperCase();
  const finalresult = firstupper + lastpart;
  console.log(finalresult);

  const menus = await menupost.find({
    $or: [
      { area: { $regex: input } },
      { area: { $regex: inputlower } },
      { area: { $regex: inputupper } },
      { area: { $regex: finalresult } },
    ],
  });

  res.render('searchmenu', {
    menus,
  });
});

//////////////////////////////////////
////About page

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/views/about.html');
});

///////////////////////////////////////////////
////////page not found

app.get('*', (req, res) => {
  res.render('allelse');
});

///////////////////////////////
//Server of the application
const port = 8080;
const server = app.listen(port, () => {
  console.log(`App running on port number ${port}...`);
});
