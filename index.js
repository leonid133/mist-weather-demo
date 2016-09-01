"use strict";

const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('index.ejs', { google_api_key: config.get('google_api_key') });
});

app.post('/forecast', (req, res) => {
  const options = {
    method: 'POST',
    uri: `${config.get('mist.address')}/jobs`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      jarPath: config.get('mist.job.jar_path'),
      className: config.get('mist.job.class_name'),
      name: config.get('mist.job.namespace'),
      parameters: req.body
    },
    json: true
  };
  request(options).then((result) => {
      res.send(result);
  });
});

app.listen(3000, () => {
  console.log("Ready!");
});
