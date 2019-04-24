'use strict';

require('decache')('../example/server.js'); // ensure we have a fresh module
var server = require('../example/server.js');
var Hoek = require('hoek');

var config = {
  "401": { // if the statusCode is 401 redirect to /login page/endpoint
    "redirect": "/login"
  },
  "403": {
    "redirect": function (request) {
      if (request.query.noredirect) {
        return false;
      }
      return "/login?redirect=" + request.url.path
    }
  }
};

module.exports = async () => {
  try {
    await server.register(require('vision'));
    await server.register({
      plugin: require('../lib/index.js'),
      options: config // pass in your redirect configuration in options
    });
    await server.views({
        engines: {
            html: require('handlebars')
        },
        path: require('path').resolve(__dirname, '../example')
    });
    Hoek.assert('no errors registering plugins');
    return server;
  } catch (e) {
    throw e;
  }
};
