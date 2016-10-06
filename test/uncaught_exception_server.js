var Hapi = require('hapi');
var Hoek = require('hoek');

var server = new Hapi.Server();
server.connection();

server.register([
  {
    register: require('good'),
    options: require('./good_options'),
  },
  {
    register: require('../lib/index.js') // hapi-error
  },
  require('vision')], function (err) {
  Hoek.assert(!err, 'no errors registering plugins');
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

server.views({
  engines: {
    html: require('handlebars')
  },
  path: require('path').resolve(__dirname, '../example')
});

module.exports = server;
