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
    path: '/admin',
    config: {
      handler: function (request, reply) {
        reply(Boom.unauthorized('Anauthorised'));
      }
    }
  }
]);

const redirectConfig = {
	"401": { // if the statusCode is 401 redirect to /login page/endpoint
		"redirect": "/login"
	}
}

server.register([{
    register: require('../lib/index.js'),
    options: redirectConfig // pass in your redirect configuration in options
  },
  require('vision')], function (err) {

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
