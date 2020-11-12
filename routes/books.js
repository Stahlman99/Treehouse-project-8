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

// Allows us to include pagination in our queries.
const paginate = (query, { page, pageSize }) => {
  const offset = page * pageSize;
  const limit = pageSize;

  return {
    ...query,
    offset,
    limit,
  };
};

/* GET book page. */
// I learned a few things about searching with Sequelize from this video - https://www.youtube.com/watch?v=6jbrWF3BWM0&t=1143s
// I learned a few things about pagination with Sequelize from this website - https://www.mcieslar.com/pagination-with-sequelize-explained
router.get('/books', asyncHandler(async(req, res) => {
  let books = null;
  let totalPages;
  let currentPage = (req.query.page === undefined) ? 0 : req.query.page;

  const Op = Sequelize.Op;
  let term;
  (req.query.term === undefined) ? term = "" : term = req.query.term;

  // Runs is there is a search term specified.
  if (term !== undefined) {
    books = await Book.findAndCountAll(
      paginate(
        {
          where: {
            [Op.or]: [
              { title: { [Op.like]: '%' + term + '%' } },
              { author: { [Op.like]: '%' + term + '%' } },
              { genre: { [Op.like]: '%' + term + '%' } },
              { year: { [Op.like]: '%' + term + '%' } }
            ]
          },
          order: [[ "title", "ASC" ]]
        },
        { page: currentPage, pageSize: 10 },
      )
    );
    
  // Returns all books if there is no search term specified.
  } else {
    books = await Book.findAndCountAll(
      paginate(
        {
          order: [[ "title", "ASC" ]] // order
        },
        { page: pageNum, pageSize: 10 },
      )
    );
  }

  totalPages = (books.count <= 10) ? 0 : Math.ceil(books.count / 10);

  res.render("index", { term, totalPages, books: books.rows, title: 'Books' });
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
router.get('/books/:id', asyncHandler(async(req, res, next) => {
  const books = await Book.findAll();
  let book = null;

  for (let i = 0; i < books.length; i++) {
    if (books[i].id == req.params.id) {
      book = books[i]
    }
  }

  if (!book) {
    const err = new Error();
    err.status = 404;
    err.message = 'Looks like the book you requested does not exist.';
    next(err);
  } else {
      res.render("update-book", { book, title: 'Update Book' });
  }  
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

module.exports = router;