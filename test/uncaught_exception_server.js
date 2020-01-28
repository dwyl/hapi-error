'use strict';

var Hapi = require('hapi');
var Hoek = require('@hapi/hoek');

var server = new Hapi.Server();

module.exports = async () => {
  try {
    await server.register({
      plugin: require('@hapi/good'),
      options: require('./good_options'),
    });
    await server.register(require('../lib/index.js'));
    await server.register(require('vision'));
    await server.views({
        engines: {
            html: require('handlebars')
        },
        path: require('path').resolve(__dirname, '../example')
    });
    server.route([
      {
        method: 'GET',
        path: '/throw',
        handler: function (request, reply) {
          throw new Error('AAAAA!');
        }
      }
    ]);
    Hoek.assert('no errors registering plugins');
    return server;
  } catch (e) {
    throw e;
  }
};
;
