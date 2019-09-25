'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Environment variable
require('dotenv').config();

// Applications
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// Express middleware
// Utilize ExpressJS functionality
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Sets the view engine for templating
app.set('view engine', 'ejs');

// Routes
app.get('/', getBooks);
app.get('/pages/searches/new', (request, response) => {
  response.render('pages/searches/new');
});
app.post('/searches', searchForBooks);
app.get('/pages/books/:book_id', getOneBook);

app.use('*', (request, response)=> response.render('pages/error'));

function Book(bookObj){
  const placeHolderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = bookObj.volumeInfo.title || 'title infromation not available';
  this.author = bookObj.volumeInfo.authors || 'author information not available';
  this.description = bookObj.volumeInfo.description || 'no description available';
  this.url = bookObj.volumeInfo.imageLinks.thumbnail || placeHolderImage;
}

function searchForBooks(request, response){
  console.log(request.body.search);
  const searchingFor = request.body.search[0];
  const searchingType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  searchingType === 'title' ? url = url+`intitle:${searchingFor}` : url = url+`inauthor:${searchingFor}`;


  superagent
    .get(url)
    .then(result => result.body.items.map(bookObj => new Book(bookObj)))
    .then(result => response.render('pages/searches/show', {searchResults: result}))
    .catch(error => handleError(error, response));
}

function handleError(error, response){
  response.render('pages/error');
}

function getBooks(reqeust, response) {
  let sql = 'SELECT * FROM books;'
  return client
    .query(sql)
    .then(result => {
      console.log(result.rows.length);
      response.render('pages/searches/show', {searchResults: result.rows})
    })
    .catch(error => handleError(error, response));
}

function getOneBook (request, response) {
  let sql = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.book_id];

  return client
    .query(sql, values)
    .then(result => response.render('pages/books/show', {book: result.rows[0]}))
    .catch(error => handleError(error, response));
}
