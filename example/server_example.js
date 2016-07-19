var Hapi = require('hapi');
var Path = require('path');
var Boom = require('boom');
var Hoek = require('hoek');
var Joi = require('joi');

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
        return Hoek.assert(!err, 'Boom Goes the Dynamite!');
        // no reply because Hoek fires an error!
      }
    }
  },
  {
    method: 'GET',
    path: '/register/{param*}',
    config: {
      validate: {
        params: { param: Joi.string().min(4).max(160).alphanum() },
        // failAction: (req, reply) => {
        //   console.log('FAIL ACTION ONLY ROUTE')
        //   return reply(Boom.notFound('hapi-error intercepts this'));
        // } // show a friendly 404 page
      },
      handler: function (request, reply) {
        console.log(request.params.param);
        if(request.params.param.indexOf('script') > -1) { // more validation
          return reply(Boom.notFound('hapi-error intercepts this'));
        } else {
          return reply('Hello ' + request.params.param + '!')
        }
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
