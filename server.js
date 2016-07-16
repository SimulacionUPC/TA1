var bodyParser = require('body-parser'),
    express = require('express'),
    path    = require("path"),
    db = require('./server/core/database.js')
    app = express();

// config file
require('./server/core/config.js')(app, express, bodyParser);
// Show the main html in the app
app.get('/', function (req, res, next) {
  try {
    res.sendFile(path.join(__dirname+'/public/_index.html'));
  } catch (err){
    console.log(err);
    res
      .status(500)
      .send({code: 500, msg: 'Internal Server Error', dev: err});
  }
});

app.get('/Generador/', function (req, res, next) {
  db.query('SELECT * FROM CONJUNTO', req.params.id, function (err, rows) {
    if (err) {
      console.log(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      return;
    } else {
      res.json({response:rows});
    }
  });
});

app.get('/Generador/:id', function (req, res, next) {
  db.query('SELECT NUMERO num FROM NUMEROS WHERE IDCONJUNTO = ?;', req.params.id, function (err, rows) {
    if (err) {
      console.log(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      return;
    } else {
      var numeros = [];
      if (rows && rows.length) {
        rows.forEach(function (item) {
          numeros.push(item.num);
        });
      }
      res.json({response: numeros});
    }
  });
});

app.post('/Generador/', function (req, res, next) {
  var conjunto = {
      nombre: req.body.nombre
    };

  db.query('INSERT INTO CONJUNTO SET ?;', conjunto, function (err, result) {
    if (err) {
      console.log(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      return;
    } else {
      var conjunto_numeros = [];

      req.body.numeros.forEach(function (item) {
        var temp = [result.insertId, item];

        conjunto_numeros.push(temp);
      });

      db.query('INSERT INTO NUMEROS (IDCONJUNTO, NUMERO) VALUES ?;', [conjunto_numeros], function (err, result) {
        if (err) {
          console.log(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        } else {
          res.json({result: {code: '001', message: 'ok'}});
          return;
        }
      });
    }
  });
});

app.listen(1235, function () {
  console.log('Public server  running at port 1235');
  console.log('http://localhost:1235');
  console.log('\tAT:' + new Date());
});