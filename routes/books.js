const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(err) {
      res.status(500).send(err)
    }
  }
}

/* GET book page. */
router.get('/books', asyncHandler(async(req, res) => {
  const books = await Book.findAll({ order: [[ "title", "ASC" ]] });
  res.render('index', { books, title: 'Books' });
}));

/* GET new book page. */
router.get('/books/new', asyncHandler(async(req, res) => {
  res.render('new-book', { book: {title: "", author: "", genre: "", year: ""}, title: 'New Book' });
}));

/* POST new book page. */
router.post('/books/new', asyncHandler(async(req, res) => {
  let book;
  console.log(req.body);
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (err) {
    if(err.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: err.errors, title: "New Book" })
    } else {
      throw err; // error caught in the asyncHandler's catch block
    }  
  }
}));

/* GET book detail page. */
router.get('/books/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render('update-book', { book, title: 'Express' });
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