const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const app = express();
const port = 4000;

app.use(bodyParser.json());

const API_KEY = "API_KEY";

let books = require("./books.json");
const { error } = require("console");

const saveBooks = () => {
    fs.writeFileSync("./books.json", JSON.stringify(books, null, 2));
}

const authenticate = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey &&apiKey === API_KEY) {
        next();
    } else {
        res.status(401).json({error:"Unauthorized"});
    }
}

app.get("/books", authenticate, (req, res) => {
    res.json(books);
});

app.get("books/:isbn", authenticate, (req, res) => {
    const book =books.find(b => b.ISBN === req.params.isbn)
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({error:"Book not found"});
    }
})

app.post("/books", authenticate, (req, res) => {
    const {title, author, publisher, publishedDate, ISBN} = req.body
    if (!title || !author || ISBN) {
        return res.status(400).json({error:"Title, Author, and ISBN are required"})
    }
    const newBook = {id: uuidv4(), title, author, publisher, publishedDate, ISBN}
    books.push(newBook)
    saveBooks()
    res.status(201).json(newBook)
})

app.put("/books/:isbn", authenticate)