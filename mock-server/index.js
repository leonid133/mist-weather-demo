"use strict";

const app = require('express')();
const bodyParser = require('body-parser');
const random = require('random-js')();
app.use(bodyParser.json());

app.post('/jobs', (req, res) => {
  var datetime = new Date().getTime();
  var duration = req.body.parameters.legs.duration.value;
  var pointsLength = req.body.parameters.points.length;
  res.send(req.body.parameters.points.map((m, idx) => {
    return {
        point: m,
        sun: random.real(0, 100),
        cloud: random.real(0, 100),
        rain: random.real(0, 100),
        temperature: random.integer(5, 30),
        datetime: new Date(datetime + duration / pointsLength * idx * 1000)
    };
  }));
});
app.listen(2100, () => {
  console.log('Started!');
});
