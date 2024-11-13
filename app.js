const path = require("path");
require("dotenv").config();
const express = require('express');
const partials = require('express-partials');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();

/*
 * Variable Declarations
*/
const PORT = 3000;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

/*
 * Passport Configurations
*/
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Return the profile in the done function
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/*
 * Express Project Setup
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());

// Configure Passport to use sessions
app.use(passport.session());

/*
 * Routes
*/

// Route to start GitHub authentication
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user'] })
);

// Callback route for GitHub to redirect to
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', successRedirect: '/' })
);

// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Protected account route
app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

// Login route
app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

/*
* Listener
*/
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

/*
* ensureAuthenticated Callback Function
*/
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
  return next();
}
res.redirect('/login');
}

