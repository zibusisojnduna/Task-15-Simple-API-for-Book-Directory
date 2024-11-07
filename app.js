const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Simulate a book directory database
let books = [
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    publisher: 'Little, Brown and Company',
    publishedDate: '1951-07-16',
    ISBN: '9780316769488'
  },
  {
    title: '1984',
    author: 'George Orwell',
    publisher: 'Secker & Warburg',
    publishedDate: '1949-06-08',
    ISBN: '9780451524935'
  }
];

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to check API key
const API_KEY = 'your-api-key-here';
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

// GET: Retrieve all books
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// GET: Retrieve a specific book by ISBN
app.get('/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(b => b.ISBN === isbn);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.status(200).json(book);
});

// POST: Add a new book to the directory
app.post('/books', checkApiKey, (req, res) => {
  const { title, author, publisher, publishedDate, ISBN } = req.body;

  // Validate input data
  if (!title || !author || !publisher || !publishedDate || !ISBN) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (books.some(b => b.ISBN === ISBN)) {
    return res.status(400).json({ error: 'Book with this ISBN already exists' });
  }

  // Add new book
  const newBook = { title, author, publisher, publishedDate, ISBN };
  books.push(newBook);

  res.status(201).json(newBook);
});

// PUT: Update a book’s details by ISBN
app.put('/books/:isbn', checkApiKey, (req, res) => {
  const isbn = req.params.isbn;
  const { title, author, publisher, publishedDate } = req.body;

  const bookIndex = books.findIndex(b => b.ISBN === isbn);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Validate data
  if (!title || !author || !publisher || !publishedDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Update the book
  books[bookIndex] = { ISBN: isbn, title, author, publisher, publishedDate };
  res.status(200).json(books[bookIndex]);
});

// DELETE: Remove a book from the directory by ISBN
app.delete('/books/:isbn', checkApiKey, (req, res) => {
  const isbn = req.params.isbn;
  const bookIndex = books.findIndex(b => b.ISBN === isbn);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Remove the book
  books.splice(bookIndex, 1);
  res.status(200).json({ message: 'Book deleted successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
