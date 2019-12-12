const sqlite3 = require('sqlite3').verbose();
var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');

let db = new sqlite3.Database('../flowers2019.db', sqlite3.OPEN_READWRITE, (err) => {
    if(err) {
        console.error(err.message);
    }
    console.log('Connected to flowers!!!');
});

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));
 
app.get('/', function (req, res) {
    db.serialize(() => {
        db.all(`SELECT comname AS name, species AS spec, genus AS gen FROM flowers`, (err, rows) => {
          if (err) {
            console.error(err.message);
          }
          res.render('home', {names: rows});
        });
    });
});

app.get('/sighted/:flower', function (req, res) {
    db.serialize(() => {
        db.all(`SELECT sighted AS date, location AS loc, person AS person, name as name FROM sightings WHERE name == "${req.params.flower}" ORDER BY sighted LIMIT 10`, (err, rows) => {
          db.all(`SELECT comname AS name, species AS spec, genus AS gen FROM flowers WHERE comname == "${req.params.flower}"`, (err, flowers) => {
            if (err) {
              console.error(err.message);
            }
            res.render('sighted', {names: rows, flower: flowers[0]});
          });
        });
    });
});

app.get('/person/:person', function (req, res) {
    db.serialize(() => {
        db.all(`SELECT name AS flower, sighted AS date, location AS loc FROM sightings WHERE person == "${req.params.person}"`, (err, rows) => {
          if (err) {
            console.error(err.message);
          }
          res.render('person', {names: rows, person_name: req.params.person});
        });
    });
});

app.post('/:flower/update', function (req, res) {
  db.serialize(() => {
    db.all(`UPDATE flowers SET genus = '${req.body.genus}', species = '${req.body.species}', comname = '${req.body.common}' WHERE comname == "${req.params.flower}"`, (err, rows) => {
      db.all(`UPDATE sightings SET name = '${req.body.common}' WHERE name == "${req.params.flower}"`, (err, rows) => {
        if (err) {
          console.error(err.message);
        }
        res.redirect(`/sighted/${req.body.common}`);
      });
    });
  });
});
 
app.listen(5000);