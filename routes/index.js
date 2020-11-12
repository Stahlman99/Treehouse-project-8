// Require packages and and sequelize models.
const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(console) {
      res.status(500).send(error)
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async(req, res) => {
  res.redirect('/books');
}));

module.exports = router;