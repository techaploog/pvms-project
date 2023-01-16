const express = require('express');

const {httpGetAllData} = require('./data.controller');

const dataRoute = express.Router();

dataRoute.get('/',httpGetAllData);

module.exports = dataRoute;