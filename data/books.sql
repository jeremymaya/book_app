DROP DATABASE book_app;
CREATE DATABASE book_app; 

\c book_app;

DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  url VARCHAR(255),
  description VARCHAR(255),
  bookshelf VARCHAR(255)
);

INSERT INTO books (author, title, isbn, url, description, bookshelf) 
VALUES('Erik Elgersma', 'The Strategist Analysis Cycle: Handbook', '9781911498360', 'http://books.google.com/books/content?id=BGc2DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api','DESCRIPTION1', 'BOOKSHELF');

INSERT INTO books (author, title, isbn, url, description, bookshelf) 
VALUES('Tara Calishainr', 'Web Search Garage', 'UOM:39076002421753', 'http://books.google.com/books/content?id=HXQDqU1zfe0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api','DESCRITPION2', 'BOOKSHELF');