const express = require('express');

const {httpGetLastest,httpGetTrackPoints} = require('./point.controllers');

const pointRouter = express.Router();

//routes
pointRouter.get('/', httpGetTrackPoints);
pointRouter.get('/latest/:tp', httpGetLastest);

module.exports = pointRouter;