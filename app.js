// Require packages and routes
var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var bookRouter = require('./routes/books');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

app.use('/', indexRouter);
app.use('/', bookRouter);

// Import sequelize instance
const db = require('./models');
const sequelize = db.sequelize;

// Test the connection to the database.
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (err) {
    console.error('Error connecting to the database: ', err);
  }
})();

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error();
  err.message = 'Uh oh! It looks like that page does not exist.'
  err.status = 404;

  console.log(`${err} / Status ${err.status}`);
  next(err);
});

// error handler
app.use((err, req, res, next) => {

  if (err.status === 404) {
    console.log(`${err} / Status: ${err.status}`);
    res.status(err.status).render('page-not-found', { err });
  } else {
    err.message = err.message || 'Oops! There was an error on the server.';
    console.log(`${err} / Status ${err.status}`);
    res.status(err.status || 500).render('error', { err } );
  }
});

module.exports = app;
