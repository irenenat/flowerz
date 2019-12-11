const sqlite3 = require('sqlite3').verbose();
var express = require('express');
var exphbs  = require('express-handlebars');

let db = new sqlite3.Database('../flowers2019.db', sqlite3.OPEN_READWRITE, (err) => {
    if(err) {
        console.error(err.message);
    }
    console.log('Connected to flowers!!!');
});
 
var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
 
app.get('/', function (req, res) {
    db.serialize(() => {
        db.all(`SELECT comname AS name, species AS spec, genus AS gen FROM flowers`, (err, rows) => {
          if (err) {
            console.error(err.message);
          }
          console.log(rows[0]);
          res.render('home', {names: rows});
        });
    });
});

app.get('/:flower', function (req, res) {
    db.serialize(() => {
        db.all(`SELECT sighted AS date, location AS loc, person AS person FROM sightings WHERE name == "${req.params.flower}" ORDER BY sighted LIMIT 10`, (err, rows) => {
          if (err) {
            console.error(err.message);
          }
          console.log(rows[0]);
          res.render('sighted', {names: rows});
        });
    });
});

app.get('/person/:person', function (req, res) {
    db.serialize(() => {
        db.all(`SELECT name AS flower, sighted AS date, location AS loc FROM sightings WHERE person == "${req.params.person}"`, (err, rows) => {
          if (err) {
            console.error(err.message);
          }
          console.log(rows);
          res.render('person', {names: rows});
        });
    });
});
 
app.listen(5000);