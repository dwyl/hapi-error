var server = require('./server.js');
var Hoek   = require('hoek');

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

server.register(
  [
    require('../lib/index.js'),
    require('vision')
  ],
  function (err) {
  Hoek.assert(!err, 'no errors registering plugins');
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: require('path').resolve(__dirname, './')
});

server.start(function (err) {
  Hoek.assert(!err, 'no errors starting server');
  server.log('info', 'Visit: ' + server.info.uri);
});

module.exports = server;
