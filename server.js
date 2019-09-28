'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

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

app.use(methodOverride ((request, response) => {
  if(request.body && typeof request.body === 'object' && '_method' in request.body){
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Sets the view engine for templating
app.set('view engine', 'ejs');

// Routes
app.get('/', loadBooks);
app.get('/details/:book_id', detailBook);
app.get('/search', searhBooks)
app.post('/result', result);
app.get('/add/:result_id', searchDetailsNew);
app.post('/add/:result_id', saveSearchedBook);
app.use('*', (request, response)=> response.render('pages/error'));

let bookArray =[];

function loadBooks(reqeust, response) {
  let sql = 'SELECT * FROM books;'

  return client
    .query(sql)
    .then(result => {
      let savedBooksNumber = result.rows.length;
      response.render('pages/index', {books: result.rows, savedBook: savedBooksNumber})
    })
    .catch(error => handleError(error, response));
}

function detailBook (request, response) {
  let sql = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.book_id];

  return client
    .query(sql, values)
    .then(result => response.render('pages/books/details', {book: result.rows[0]}))
    .catch(error => handleError(error, response));
}

function searhBooks (request, response) {
  response.render('pages/searches/new')
}

function result(request, response){
  const searchingFor = request.body.search[0];
  const searchingType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  searchingType === 'title' ? url = url+`intitle:${searchingFor}` : url = url+`inauthor:${searchingFor}`;

  superagent
    .get(url)
    .then(result => {
      let i = -1;
      return result.body.items.map(bookObj => {
        i++;
        return new Book(bookObj, i)
      });
    })
    .then(result => {
      bookArray = result;
      response.render('pages/searches/show', {books: result})
    })
    .catch(error => handleError(error, response));
}

function searchDetailsNew (request, response) {
  response.render('pages/books/show', {book: bookArray[request.params.result_id]})
}

function saveSearchedBook (request, response){
  let { author, title, isbn, url, description } = request.body;

  const sql = 'INSERT INTO books (author, title, isbn, url, description) VALUES ($1, $2, $3, $4, $5);';
  const values = [author, title, isbn, url, description];

  client.query(sql, values).then(loadBooks(request, response));
}

function Book(bookObj, i){
  const placeHolderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = bookObj.volumeInfo.title || 'title infromation not available';
  this.author = bookObj.volumeInfo.authors || 'author information not available';
  this.description = bookObj.volumeInfo.description || 'no description available';
  this.url = bookObj.volumeInfo.imageLinks.thumbnail || placeHolderImage;
  this.isbn = bookObj.volumeInfo.industryIdentifiers[0].identifier;
  this.result_id = i;
}

function handleError(error, response){
  response.render('pages/error');
}
