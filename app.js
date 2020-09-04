/*jslint node: true */
/*jshint esnext: true */
//"use strict";
console.log("app.js");
var db = require('./db');

/**
 * Module dependencies.
 */
const Prismic = require('prismic-javascript');
const PrismicDOM = require('prismic-dom');
const app = require('./config');
const Cookies = require('cookies');
const PrismicConfig = require('./prismic-configuration');

const cors = require('cors');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

var Bottleneck = require('bottleneck');

const util = require('util');


//const popper = require('popper');
//const jquery = require('jquery');
//const bootstrap = require('bootstrap');
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

//const dashboard = require('node-meraki-dashboard')(process.env.MERAKI_API_KEY);


/**
 * Connect to MongoDB.
 */
 const mongoURI = process.env.MONGODB_URI || process.env.MONGOLAB_URI;

mongoose.Promise = global.Promise;
const option = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000
};
const mongostore = new MongoStore({
        url: mongoURI,
        autoReconnect: true,
        clear_interval: 3600
    });
//mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
//mongoose.connect('mongodb://mongo:27017');
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: mongostore
}));

var promise = mongoose.connect(mongoURI, {useMongoClient: true}).then(function(){
    //connected successfully
    //console.log("connected success. Promise: " + promise.toString());
}, function(err) {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});
/*
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

*/
const PORT = app.get('port');

app.listen(PORT, () => {
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: mongostore
}));

const corsOptions = {
  origin: '*'
}



app.use(cors(corsOptions));
// Add headers

app.options('*', cors()); // include before other routes 

/*
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
*/
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');
const merakiController = require('./controllers/meraki');

const passportConfig = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(expressStatusMonitor());

app.use((req, res, next) => {
  //res.locals.success_messages = req.flash('success');
  res.locals.user = req.user;
  next();
});

app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: PrismicConfig.apiEndpoint,
    linkResolver: PrismicConfig.linkResolver,
    htmlSerializer: PrismicConfig.htmlSerializer,
  };
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM;
  Prismic.api(PrismicConfig.apiEndpoint, {
    accessToken: PrismicConfig.accessToken,
    req,
  }).then((api) => {
    req.prismic = { api };
    next();
  }).catch((error) => {
    next(error.message);
  });
});

app.use(passport.initialize());
app.use(passport.session());

//NEW
app.use(expressValidator());

 async function getMenu(req, res, next) {
  req.prismic.api.getSingle('mainmenu')
  .then( (menu) => {
    res.locals.menu = menu 
    req.prismic.api.getSingle('menu3')
    .then((menu3) => {
      res.locals.menu3 = menu3;
      //res.locals.menu = new Array();
      //res.locals.menu[0] =  req.prismic.api.getByUID('menu3', "menu-services");
      //res.locals.menu[1] =  req.prismic.api.getByUID('menu3', "menu-unternehmen");
      //console.log("menutest:"); console.dir(res.locals.menu3);
      //next();
  } );
  
  });
  
  
}
// Query the site layout with every route 
app.route('*').get((req, res, next) => {
  
  console.log("route *");
  //getMenu(req, res, next);
  req.prismic.api.getSingle('menu3')
  .then( (menu3) => {
    res.locals.menu3 = menu3;
    console.log("menu3: " + menu3);
    console.dir(menu3);
  });
  console.log("in *********");
  console.dir(res.locals);
  next();
  
  
  
  /*
  req.prismic.api.getSingle('menu')
  .then(function(menuContent){
    // Define the layout content
    res.locals.menuContent = menuContent;
    //next();
  });
  req.prismic.api.getSingle('menu3')
  .then(function(menu3Content){
    //console.login(JSON.stringify(menu3Content));
    // Define the layout content
    res.locals.menu3Content = menu3Content;
    next();
  });
  */
});

// ROUTES NEW
//app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);

app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);

app.get('/map/:mapid', passportConfig.isAuthenticated, homeController.getMap);
app.get('/form/:formid', passportConfig.isAuthenticated, homeController.getForm);
app.get('/ticket', passportConfig.isAuthenticated, homeController.getTicket);
app.post('/ticket', passportConfig.isAuthenticated, homeController.postTicket);




//app.get('/mxl3print', merakiController.getMxl3print);
/*
app.get('/mxl3print', function(req, res) {
  dashboard.organizations.list()
    .then(orgs => {
      //console.dir(orgs);
        res.render('mxl3print', {orgs: orgs});
    });
}); 
app.get('/mxl3print/vlan200/:netid?',  merakiController.getMxl3print); 

app.get('/mxl3print/org/:orgid', merakiController.getMxl3printOrg);

app.get('/switchamp/:orgid/:mode',  merakiController.getSwitchAMP); 
*/
app.get('/index-frontier', homeController.getIndexFrontier);

app.get('/kaemi-page/:uid', function (req, res)  {
    const uid = req.params.uid;

    // Get a page by its uid
    req.prismic.api.getByUID("kaemi-page", uid)
    .then((pageContent) => {
      if (false) {//(!req.user) {
        req.flash('message', 'not logged in');
        res.redirect('/');
      }
      if (pageContent) {
        console.log("ctx:");console.dir(res.locals.ctx);
        res.render('kaemi-page', { title: 'KAEMI Page ' + uid, pageContent, uid,  user: req.user, ctx:ctx });
      } else {
        res.status(404).render('404');
      }
    })
    .catch((error) => {
      //next(`error when retriving page ${error.message}`);
    });
  
});
/*
 * -------------- Routes --------------
 */

 /* GET Home Page */
app.get('/profile', isAuthenticated,  function(req, res){
  req.prismic.api.getSingle("page")
  .then((pageContent) => {
    if (pageContent) {
      
      res.render('profile', { pageContent: pageContent, user: req.user, message: req.flash('message')  });
    } else {
      res.status(404).send('Could not find a homepage document. Make sure you create and publish a homepage document in your repository.');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});
 
// As with any middleware it is quintessential to call next()
// if the user is authenticated
function isAuthenticated  (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

 app.get('/map_old/:mapid', (req, res) => {
  const mapid = req.params.mapid;

  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   session: true ,
                                   failureFlash: true });
  req.prismic.api.getByUID("map-page", mapid)
  .then((pageContent) => {
    if (!req.user) {
      res.redirect('/login');
    }
    if (pageContent) {
      
      res.render('map-page', { pageContent: pageContent, user: req.user, mapid: mapid });
    } else {
      res.status(404).send('Could not find a homepage document. Make sure you create and publish a homepage document in your repository.');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});

/*
 * Homepage FR route
 */
app.get('/index-frontier',  (req, res, next) => {
  
  //console.log('get / user: ' + JSON.stringify(req.user));
                                   
  req.prismic.api.getSingle("homepage")
  .then((pageContent) => {
    if (pageContent) {
      res.render('index-frontier', { pageContent: pageContent });
    } else {
      res.status(404).send('Could not find a homepage document. Make sure you create and publish a homepage document in your repository.');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});

/**
 * LOGIN
 
app.get('/loginasD', (req, res, next) => {
  passport.authenticate('local', { successRedirect: '/profile',
                                   failureRedirect: '/',
                                   session: true ,
                                   failureFlash: true });
  console.log('get/: ' + JSON.stringify(req.user));
                                   
  req.prismic.api.getSingle("homepage")
  .then((pageContent) => {
    if (pageContent) {
      
      res.render('homepage', { pageContent: pageContent, user: req.user });
    } else {
      res.status(404).send('Could not find a homepage document. Make sure you create and publish a homepage document in your repository.');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});

app.post('/login', 
  passport.authenticate('local', { 
    failureRedirect: '/',   
    successFlash: true
             }),
  function(req, res) {
    req.flash('message', 'login flash');
    res.redirect('/profile');
  });


app.get('/logout',
  function(req, res){
    req.logout();
    req.flash('message', 'logged out');
    res.redirect('/');
  });

*/

/*
 * Preconfigured prismic preview
 */
app.get('/preview', (req, res) => {
  const token = req.query.token;
  if (token) {
    req.prismic.api.previewSession(token, PrismicConfig.linkResolver, '/')
    .then((url) => {
      const cookies = new Cookies(req, res);
      cookies.set(Prismic.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
      res.redirect(302, url);
    }).catch((err) => {
      res.status(500).send(`Error 500 in preview: ${err.message}`);
    });
  } else {
    res.send(400, 'Missing token from querystring');
  }
});

/*
 * Page route
 */
app.get('/:uid', (req, res, next) => {
  // Store the param uid in a variable
  const uid = req.params.uid;
  //console.log("get uid: " + uid);
  //console.log("ctx:");console.dir(res.locals.ctx);#
  console.log("res.locals:");
  console.dir(res.locals);
  // Get a page by its uid
  req.prismic.api.getByUID("page", uid)
  .then((pageContent) => {
    if (!req.user) {
      req.flash('message', 'not logged in');
      //res.redirect('/');
    }
    if (pageContent) {

      console.log("----1");
      console.dir(res.locals.ctx);
      console.log("----2");
      console.dir(PrismicConfig.linkResolver);
      res.render('page', { pageContent, 
                  user: req.user , 
                  menu : res.locals.menu,
                  mk1: PrismicConfig,
                  ctx: res.locals.ctx,
                  linkResolver2: PrismicConfig.linkResolver});
    } else {
      res.status(404).render('404');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});



/*
 * Homepage route
 */
app.get('/',  (req, res, next) => {
  console.log("start app.get /");
  
  let teaserbox1;
  //console.log('get / user: ' + JSON.stringify(req.user));
 
  //req.prismic.api.getByUID('teaserbox2', 'funktionen2')
  //.then((document) => {teaserbox1 = document;return document;})
  
  //.then(console.log("TEASERBOX mk1" + console.log(document))) 
  ;//then(teaserbox1 = teaserbox1);
  //console.log("outer: " + JSON.stringify(teaserbox1));
  
  
  req.prismic.api.getSingle("homepage")
  .then(async (pageContent) => {
    if (pageContent) {
      //res.locals.menu3 = await req.prismic.api.getSingle('mainmenu');
      await getMenu(req, res, next);
      console.log("res.locals: in getsingle homepage");
      console.dir(res.locals);
      //console.log(JSON.stringify(pageContent));
      //let teaserbox3 = await req.prismic.api.getByUID('teaserbox2', 'funktionen2');
      //console.log("3: " + JSON.stringify(teaserbox3));
      res.render('index', { 
        pageContent: pageContent, 
        menu: res.locals.menu,
        menu3: res.locals.menu3 });
    } else {
      res.status(404).send('Could not find a homepage document. Make sure you create and publish a homepage document in your repository.');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message} 4711`);
  });
});




