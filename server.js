'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');

// Applications
const app = express();
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

// Sets the view engine for templating
app.set('view engine', 'ejs');

// Routes
app.get('/', (request, response) => {
  response.render('pages/index');
})

app.post('/searches', searchForBooks);

app.use('*', (request, response)=> response.render('pages/error'));

function Book(bookObj){
  const placeHolderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = bookObj.volumeInfo.title || 'title infromation not available';
  this.author = bookObj.volumeInfo.author || 'author information not available';
  this.description = bookObj.volumeInfo.description || 'no description available';
  this.image = bookObj.volumeInfo.imageLinks.thumbnail || placeHolderImage;
}

function searchForBooks(request, response){
  console.log(request.body.search);
  const searchingFor = request.body.search[0];
  const searchingType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  searchingType === 'title' ? url = url+`inauthor:${searchingFor}` : url = url+`intitle:${searchingFor}`;

  superagent
    .get(url)
    .then(result => result.body.items.map(bookObj => new Book(bookObj)))
    .then(result => response.render('pages/searches/show', {searchResults: result}))
    .catch(error => errorHandler(error, response));
}

function errorHandler(error, response){
  response.render('pages/error');
}
