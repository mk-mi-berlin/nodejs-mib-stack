const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  console.log('LocalStrategy!!');
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      console.log(email + ' not found!!');
      return done(null, false, { msg: `Email ${email} not found.` });
    }
      console.log('LocalStrategy!!2');

    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
          console.log('LocalStrategy!!3');

        return done(null, user);
      }
        console.log('LocalStrategy!!4');

      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};

/// OLD
  //passportjs
/**
passport.deserializeUser(function(username, done) {
  console.log('Deserialize user called.');
  db.users.findByUsername( username , function(err, user) {
      if (err) { 
        console.log('err: ' + err);
        return done(err); 
      }
    return done(null, user);
  });
});
passport.serializeUser(function(user, done) {
  console.log('Serialize user called.');
  return done(null, user.username);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    db.users.findByUsername( username , function(err, user) {
      if (err) { 
        console.log('err: ' + err);
        return done(err); 
      }
      if (!user) {
        console.log('user is null bbb');
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.password == password) {
        console.log('invalid pass');
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log('xdone');
      return done(null, user);
    });
  }
));
*/