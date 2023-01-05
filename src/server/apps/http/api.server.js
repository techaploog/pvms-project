const http = require("http");

const app = require('./app');

const apiServer = http.createServer(app);

module.exports = apiServer;