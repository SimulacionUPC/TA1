/*var mysql = require('mysql'),
    connection = mysql.createConnection({
      host     : '162.243.207.156',
      user     : 'root',
      password : '123',
      database : 'documentario',
      multipleStatements: true
    });*/

var mysql = require('mysql'),
    connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'test_migration',
      multipleStatements: true
    });

module.exports = connection;
