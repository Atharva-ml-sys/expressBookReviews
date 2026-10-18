
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const auth = require('./auth_users.js');

const public_users = express.Router();

// Base URL of this project's local server
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (auth.isValid(username)) {
    return res.status(409).json({
      message: 'User already exists'
    });
  }

  auth.users.push({ username, password });

  return res.status(200).json({
    message: 'User successfully registered. Now you can login'
  });
});

// Get all available books
public_users.get('/', async (req, res) => {
  try {
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get book by ISBN using Axios and async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve book' });
  }
});

// Get books by author using Axios and async/await
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    const author = req.params.author.toLowerCase();

    const result = Object.values(response.data).filter(book =>
      book.author && book.author.toLowerCase() === author
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books by author' });
  }
});

// Get books by title using Axios and async/await
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    const title = req.params.title.toLowerCase();

    const result = Object.values(response.data).filter(book =>
      book.title && book.title.toLowerCase().includes(title)
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books by title' });
  }
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
