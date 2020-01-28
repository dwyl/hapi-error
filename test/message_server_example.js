'use strict';

require('decache')('../example/server.js');
// ensure we have a fresh module
var server = require('../example/server.js');
var Hoek = require('@hapi/hoek');
var Path = require('path');
var Handlebars = require('handlebars');

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

module.exports = async () => {
  try {
    await server.register({ plugin: require('../lib/index.js'), options: config });
    Hoek.assert('no errors registering plugins');
    return server;
  } catch (e){
    throw e;
  }
};
