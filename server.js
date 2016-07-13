var bodyParser = require('body-parser'),
    express = require('express'),
    path    = require("path"),
    db = require('./server/core/database.js')
    app = express();

/*function onRequest(request, response) {
    console.log("Request made" + request.url);
    response.writeHead(200, {"Context-Type": "text/plain"});
    response.write("Data");
    response.end();
}*/

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
  console.log("HOLAAA GET");
  res.json({result: "GET"});
});

app.get('/Generador/:id', function (req, res, next) {
  console.log("HOLAAA GET:id");
  db.query('SELECT * FROM NUMEROS WHERE IDCONJUNTO = ?;', req.params.id, function (err, rows) {
    if (err) {
      console.log(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      return;
    } else {
      res.json(rows[0]);
    }
  });
});

app.post('/Generador/', function (req, res, next) {
  console.log(req.body.nombre);
  console.log(req.body.numeros);
  console.log("HOLAAA POST");
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

      console.log("A guardar en 'NUMEROS':");
      console.log(conjunto_numeros);
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

app.listen(1234, function () {
  console.log('Public server  running at port 1234');
  console.log('http://localhost:1234');
  console.log('\tAT:' + new Date());
});