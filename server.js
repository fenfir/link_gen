var express = require('express');
var app = express();
var logger = require('./logger.js');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));

var fnList = {
  randomString: randomString
}

var varList = {
  count: { value: 1000, fn: false },
  subDomain: { value: fnList.randomString, fn: true },
  domain: { value: 'mike.com', fn: false },
  linkPath: { value: 'cat', fn: false },
  extension: { value: 'jpg', fn: false },
  linkText: { value: fnList.randomString, fn: true }
};

function linkTemplate () {
  return "<img src='http://" + varList['subDomain'].value() + "." + varList['domain'].value + "/" + varList['linkPath'].value + '.' + varList['extension'].value + "'>" + varList['linkText'].value() + "</img>";
}

function randomString() {
    var length = 3;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


var port = process.env.PORT || 8080

app.get('/', handleBaseConfig);
function handleBaseConfig(req, res) {
 var link = ''
 for (var i = 0; i < varList['count'].value; i++) {
  link += linkTemplate();
 }

 res.send(link);
};

app.get('/admin/', adminPage);

app.post('/admin', (req,res) => {
  for (var prop in req.body) {
    if (varList[prop].fn) {
      //varList[prop].value = fnList[req.body[prop]];
    } 
    else {
      varList[prop].value = req.body[prop];
    }
  }

  res.send(adminPage(req, res));
});

function adminPage(req, res) {
  var adminPage = '<form method="post" action="/admin">';

  for (var prop in varList) {
    if (varList[prop].fn) {
      //adminPage += prop + '<input type="text" name="'+ prop + '" value="' + varList[prop].value() + '"><br>';
    }

    adminPage += prop + '<input type="text" name="'+ prop + '" value="' + varList[prop].value + '"><br>';
  }

  adminPage += "<input type='submit' /></form>";
  console.log(linkTemplate());
  adminPage += "<div>" + linkTemplate() + "</div>";
  res.send(adminPage);
}

var server = app.listen(port);
logger.info('Listening on port ' + port);

module.exports = server;