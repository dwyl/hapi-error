require('decache')('../example/server.js');
// ensure we have a fresh module
var server = require('../example/server.js');
var Hoek = require('hoek');
var Vision = require('vision');
var Path = require('path');
var Handlebars = require('handlebars');
var HapiError = require('../lib/index.js');

var config = {
  404: { // if the statusCode is 401 redirect to /login page/endpoint
    message: function () {
      return 'robots in disguise';
    }
  },
  500: {
    message: function (msg, request) {
      return 'User agent: ' + request.headers['user-agent'];
    }
  }
};

server.register([
  { register: HapiError, options: config },
  Vision
], function (err) {
  Hoek.assert(!err, 'no errors registering plugins');
});

server.views({
  engines: { html: Handlebars },
  path: Path.resolve(__dirname, '../example')
});

module.exports = server;
