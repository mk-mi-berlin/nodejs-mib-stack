
/**
 * Module dependencies.
 */
var express = require('express'),
    session = require('express-session'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path');
const sass = require('node-sass-middleware');



var flash = require('connect-flash');




module.exports = function() {
  var app = express();
  var passport = require('passport');
  var BasicStrategy = require('passport-http').BasicStrategy;
  var LocalStrategy = require('passport-local').Strategy;
  var db = require('./db');
  // all environments
  app.set('port', process.env.PORT || 3333);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
  app.use(favicon("public/images/punch.png"));
  
  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(errorHandler());
  app.use(flash());
  app.use(session({ secret: 'anything' }));
  



  return app;
}();
