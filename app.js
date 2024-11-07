const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
const port = 3000;


app.use(bodyParser.json());


function loadBooksData() {
  const data = fs.readFileSync('./books.json', 'utf8');
  return JSON.parse(data);
}

// Save books data to JSON file
function saveBooksData(books) {
  fs.writeFileSync('./books.json', JSON.stringify(books, null, 2), 'utf8');
}

// Authorization middleware to check API key
function authenticateAPIKey(req, res, next) {
  const apiKey = req.header('x-api-key');
  if (apiKey === process.env.API_KEY) {
    next(); // Proceed to the next middleware or route
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }
}


app.get('/api/books', authenticateAPIKey, (req, res) => {
  const books = loadBooksData();
  if (req.query.isbn) {
    const book = books.find(b => b.ISBN === req.query.isbn);
    if (book) {
      return res.json(book);
    } else {
      return res.status(404).json({ error: 'Book not found' });
    }
  }
  res.json(books);
});


app.post('/api/books', authenticateAPIKey, (req, res) => {
  const { title, author, publisher, publishedDate, ISBN } = req.body;

  
  if (!title || !author || !publisher || !publishedDate || !ISBN) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (isNaN(ISBN)) {
    return res.status(400).json({ error: 'ISBN must be a valid number' });
  }

  const books = loadBooksData();
  
  if (books.find(b => b.ISBN === ISBN)) {
    return res.status(400).json({ error: 'Book with this ISBN already exists' });
  }

  
  const newBook = { title, author, publisher, publishedDate, ISBN };
  books.push(newBook);
  saveBooksData(books);

  res.status(201).json(newBook);
});


app.put('/api/books/:isbn', authenticateAPIKey, (req, res) => {
  const { isbn } = req.params;
  const { title, author, publisher, publishedDate } = req.body;


  if (!title || !author || !publisher || !publishedDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const books = loadBooksData();
  const bookIndex = books.findIndex(b => b.ISBN === isbn);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  
  books[bookIndex] = { ...books[bookIndex], title, author, publisher, publishedDate };
  saveBooksData(books);

  res.json(books[bookIndex]);
});


app.delete('/api/books/:isbn', authenticateAPIKey, (req, res) => {
  const { isbn } = req.params;
  const books = loadBooksData();
  const bookIndex = books.findIndex(b => b.ISBN === isbn);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  
  const deletedBook = books.splice(bookIndex, 1);
  saveBooksData(books);

  res.json({ message: 'Book deleted', book: deletedBook[0] });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
