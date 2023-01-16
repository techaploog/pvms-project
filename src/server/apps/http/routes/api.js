const express = require('express');

const pointRouter = require('./trackPoint/point.routes');
const dataRouter = require('./dataRoute/data.routes');

const api = express.Router();

api.use('/points',pointRouter);
api.use('/data',dataRouter);

module.exports = api;