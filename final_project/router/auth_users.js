const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: 'Error logging in' });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send('User successfully logged in');
  } else {
    return res.status(208).json({ message: 'Invalid Login. Check username and password' });
  }
});

regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn]; // Access the book using the given ISBN

  if (book) {
    const review = req.body.review;
    const username = req.session.authorization.username;

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review; // Add or update the review
    books[isbn] = book; // Update the book in the books object

    return res.status(200).json({ message: `Review for book with ISBN ${isbn} by user ${username} updated.` });
  } else {
    return res.status(404).json({ message: 'Book not found!' });
  }
});

// Add the DELETE endpoint
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn]; // Access the book using the given ISBN

  if (book) {
    const username = req.session.authorization.username;

    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username]; // Delete the review by the user
      books[isbn] = book; // Update the book in the books object

      return res.status(200).json({ message: `Review for book with ISBN ${isbn} by user ${username} deleted.` });
    } else {
      return res.status(404).json({ message: `No review found for book with ISBN ${isbn} by user ${username}.` });
    }
  } else {
    return res.status(404).json({ message: 'Book not found!' });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
