// create web server
const express = require('express');
const app = express();
const port = 3000;

// middleware to parse JSON bodies
app.use(express.json());

// define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/comments', (req, res) => {
  const comment = req.body;
  // TODO: Save comment to database
  res.status(201).send(comment);
});