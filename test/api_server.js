'use strict';

// this mini server is for: https://github.com/dwyl/hapi-error/issues/49
var Hapi = require('hapi');
var Hoek = require('@hapi/hoek');

var server = new Hapi.Server();

// no server.routes required as we are *trying* to test for an error!

module.exports = async () => {
  try {
    await server.register(require('../lib/index.js'));
    Hoek.assert('no errors registering plugins');
    return server;
  } catch (e) {
    throw e;
  }
};
