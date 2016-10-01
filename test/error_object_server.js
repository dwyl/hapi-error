require('decache')('../example/server.js'); // ensure we have a fresh module
var server = require('../example/server.js');
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
  path: require('path').resolve(__dirname, '../example')
});

module.exports = server;
