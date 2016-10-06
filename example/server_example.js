var server = require('./server.js');
var Hoek   = require('hoek');

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
