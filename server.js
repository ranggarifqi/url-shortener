'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');

var cors = require('cors');

var bodyParser = require('body-parser')

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
mongoose.connect('mongodb://rangga:rangga123@ds149495.mlab.com:49495/freecodecamp');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

const URLModel = require('./models/url');

const is_url = (str) => {
  const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if (regexp.test(str)) {
    return true;
  }
  return false;
}

app.post("/api/shorturl/new", function (req, res) {
  const url = req.body.url;

  // Check if Valid URL
  if (!is_url(url)) {
    return res.json({error: 'invalid URL'});
  }

  // Check if DNS Lookup = true
  dns.lookup(url, (err, address, family) => {
    if (err) return res.json({error: 'invalid URL'});

    // Set initial payload
    let payload = {
      original_url: url
    };

    // Check if url already registered
    URLModel.findOne({ original_url: url }, function (err, fUrl) {
      if (err) return res.status(500).json({error: err.message});
      
      if (!fUrl) {
        // get Highest short url value
        URLModel.find(null, null, { sort: { short_url: -1 }, limit: 1 }, function (err, highestUrl) {
          if (err) return res.status(500).json({error: err.message});
          
          if (highestUrl.length > 0) {
            payload.short_url = highestUrl[0].short_url + 1;
          } else {
            payload.short_url = 1;
          }

          // Create the record
          URLModel.create(payload, function (err, cUrl) {
            if (err) return res.status(500).json({error: err.message});
            return res.json({ original_url: cUrl.original_url, short_url: cUrl.short_url });
          })
        });
      } else {
        // Return that record
        return res.json({ original_url: fUrl.original_url, short_url: fUrl.short_url });
      }
    });

  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});