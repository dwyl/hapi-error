'use strict';

var Hapi = require('hapi');
var Boom = require('@hapi/boom');
var Hoek = require('@hapi/hoek');
var Joi = require('joi');

var server = new Hapi.Server({ port: process.env.PORT });

server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {
        var err = null;
        request.handleError(err);
        return 'hello';
      }
    }
  },
  {
    method: 'GET',
    path: '/error',
    config: {
      handler: function (request, reply) {
        throw new Error('500');
      }
    }
  },
  {
    method: 'GET',
    path: '/admin',
    config: {
      handler: function (request, reply) {
        throw Boom.unauthorized('Anauthorised');
      }
    }
  },
  {
    method: 'GET',
    path: '/management',
    config: {
      handler: function (request, reply) {
        throw Boom.forbidden('forbidden');
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
          throw Boom.notFound('hapi-error intercepts this');
        } else {
          return 'Hello ' + request.params.param + '!';
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/login',
    config: {
      handler: function (request, reply) {
        return 'please login';
      }
    }
  }
]);

module.exports = server;
