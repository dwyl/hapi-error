var Hapi = require('hapi');
var Path = require('path');
var Boom = require('boom');
var Hoek = require('hoek');

var server = new Hapi.Server();
server.connection({ port: process.env.PORT });

server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {
        reply('hello');
      }
    }
  },
  {
    method: 'GET',
    path: '/error',
    config: {
      handler: function (request, reply) {
        reply(new Error('500'));
      }
    }
  },
  {
    method: 'GET',
    path: '/admin',
    config: {
      handler: function (request, reply) {
        reply(Boom.unauthorized('Anauthorised'));
      }
    }
  },
  {
    method: 'GET',
    path: '/hoek',
    config: {
      handler: function (request, reply) {
        var err = true; // force error using hoek
        Hoek.assert(!err, 'Boom Goes the Dynamite!');
        // no reply because Hoek fires an error!
      }
    }
  }
]);

server.register([require('../lib'), require('vision')], function (err) {
  Hoek.assert(!err, 'no errors registering plugins');
  server.views({
    engines: {
      html: require('handlebars')
    },
    path: Path.resolve(__dirname, './')
  });

  server.start(function (err) {
    Hoek.assert(!err, 'no errors starting server');
    console.log('Visit:', server.info.uri);
  });
});

module.exports = server;
