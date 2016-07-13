var mysql = require('mysql'),
    connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'generador',
      multipleStatements: true
    });

module.exports = connection;
