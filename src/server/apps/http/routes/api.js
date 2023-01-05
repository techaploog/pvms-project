const express = require('express');

const pointRouter = require('./trackPoint/point.routes');

const api = express.Router();

api.use('/points',pointRouter);

module.exports = api;