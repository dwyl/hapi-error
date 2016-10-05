var Hapi = require('hapi');
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
        var err = null;
        request.handleError(err);
        return reply('hello');
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
    path: '/register/{param*}',
    config: {
      validate: {
        params: { param: Joi.string().min(4).max(160).alphanum() },
      },
      handler: function (request, reply) {
        if(request.params.param.indexOf('script') > -1) { // more validation
          return reply(Boom.notFound('hapi-error intercepts this'));
        } else {
          return reply('Hello ' + request.params.param + '!')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/login',
    config: {
      handler: function (request, reply) {
        reply('please login');
      }
    }
  }
]);

module.exports = server;
