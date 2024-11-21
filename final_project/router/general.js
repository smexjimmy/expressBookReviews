const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user already exists
    if (!users.some(user => user.username === username)) {
      // Add the new user to the users array
      users.push({ username, password });
      return res.status(200).json({ message: 'User successfully registered. Now you can login' });
    } else {
      return res.status(409).json({ message: 'User already exists!' });
    }
  }
  return res.status(400).json({ message: 'Unable to register user. Username or password missing.' });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Convert books object to an array
  const booksArray = Object.values(books);

  // Find the book with the given ISBN
  const book = booksArray.find(book => book.isbn === isbn);

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: 'Book not found' });
  }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksArray = Object.values(books);
  const booksByAuthor = booksArray.filter(book => book.author.toLowerCase() === author);

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: 'No books found by this author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksArray = Object.values(books);
  const booksByTitle = booksArray.filter(book => book.title.toLowerCase() === title);

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: 'No books found by this title' });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
   const isbn = req.params.isbn; 
   const booksArray = Object.values(books); 
   const book = booksArray.find(book => book.isbn === isbn); 
   if (book) {
     return res.status(200).json(book.reviews); 
    } 
   else {
     return res.status(404).json({ message: 'Book not found' }); } 
    });

module.exports.general = public_users;
