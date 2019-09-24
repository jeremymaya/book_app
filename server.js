'use strict';

// Dependencies
const express = require('express');

// Applications
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

// Sets the view engine for templating
app.set('view engine', 'ejs');

// Routes
app.get('/', (request, response) => {
  response.render('pages/index');
})

