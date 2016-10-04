var Hapi = require('hapi');
var Hoek = require('hoek');

var server = new Hapi.Server();
server.connection();

var goodOptions = {
  ops: {
    interval: 30000 // reporting interval (30 seconds)
  },
  reporters: {
    myConsoleReporter: [{
    module: 'good-squeeze', // https://github.com/hapijs/good-squeeze
    name: 'Squeeze',
    args: [{ log: '*', error: '*', response: '*', request: '*', ops: '*' }]
    }, {
      module: 'good-console'
    }, 'stdout']
  }
};

server.register([
  {
    register: require('good'),
    options: goodOptions,
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
