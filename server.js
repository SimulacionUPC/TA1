var bodyParser = require('body-parser'),
    express = require('express'),
    path    = require("path"),
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

app.listen(1234, function () {
  console.log('Public server  running at port 1234');
  console.log('http://localhost:1234');
  console.log('\tAT:' + new Date());
});