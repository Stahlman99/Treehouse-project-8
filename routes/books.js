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

/* GET book page. */
router.get('/books', asyncHandler(async(req, res) => {
  const books = await Book.findAll();
  res.render('index', { books, title: 'Books' });
}));

/* GET new book page. */
router.get('/books/new', asyncHandler(async(req, res) => {
  // res.render('index', { title: 'Express' });
}));

/* POST new book page. */
router.post('/books', asyncHandler(async(req, res) => {
  // res.render('index', { title: 'Express' });
}));

/* GET book page. */
router.get('/books', asyncHandler(async(req, res) => {
  // res.render('index', { title: 'Library' });
}));

/* GET book detail page. */
router.get('/books/:id', asyncHandler(async(req, res) => {
  // res.render('index', { title: 'Express' });
}));

/* POST update book page. */
router.post('/books/:id', asyncHandler(async(req, res) => {
  // res.render('index', { title: 'Express' });
}));

/* POST delete book page. */
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  // res.render('index', { title: 'Express' });
}));

module.exports = router;