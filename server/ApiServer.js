var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    connection = require('./core/database.js');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

app.use(cors());

require('../server/features/login.js')(app, connection);

app.listen(3000, function () {
  'use strict';
  /*eslint-disable no-console*/
  console.log('APi server running at port 3000');
  console.log('http://localhost:3000');
  /*eslint-enable no-console*/
});
