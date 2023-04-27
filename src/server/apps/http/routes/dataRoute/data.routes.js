const express = require('express');

const {httpGetAllData, httpGetSelectData} = require('./data.controller');

const dataRoute = express.Router();

dataRoute.get('/',httpGetAllData);
dataRoute.get('/alt',httpGetSelectData);

module.exports = dataRoute;