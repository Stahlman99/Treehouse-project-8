// Require packages and sequelize models.
const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const { sequelize } = require('../models');

// Async handler to reduce code and maintain DRY programming.
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
  res.render("index", { books, title: 'Books' });
}));

/* GET new book page. */
router.get('/books/new', asyncHandler(async(req, res) => {
  res.render("new-book", { book: {title: "", author: "", genre: "", year: ""}, title: 'New Book' });
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
  res.render("update-book", { book, title: 'Update Book' });
}));

/* POST update book page. */
router.post('/books/:id', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    if(err.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct article gets updated
      res.render("update-book", { book, errors: err.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
}));

/* POST delete book page. */
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

/* GET search books page. */
router.get('/search', asyncHandler(async(req, res) => {
  const Op = Sequelize.Op;
  const { term } = req.query;
  const books = await Book.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: '%' + term + '%' } },
        { author: { [Op.like]: '%' + term + '%' } },
        { genre: { [Op.like]: '%' + term + '%' } },
        { year: { [Op.like]: '%' + term + '%' } }
      ]
    }
  });
  res.render("index", { books, title: 'Search Books' });
}));

module.exports = router;