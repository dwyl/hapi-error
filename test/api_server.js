// this mini server is for: https://github.com/dwyl/hapi-error/issues/49
var Hapi = require('hapi');
var Hoek = require('hoek');

var server = new Hapi.Server();


server.register({ register: require('../lib/index.js') }, (err) => {
  Hoek.assert(!err, 'no errors registering plugins');
});

// no server.routes required as we are *trying* to test for an error!

module.exports = server;
