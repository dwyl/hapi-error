'use strict';

process.env.JWT_SECRET = 'supersecret'; // github.com/dwyl/hapi-auth-jwt2#generating-your-secret-key
var Hapi = require('hapi');
var path = require('path');
var Hoek = require('@hapi/hoek');
var assert = require('assert');
var server = new Hapi.Server({ port: 8765, debug: false });


var db = {
  '123': { allowed: true,  name: 'Charlie', email: 'charlie@mail.co' },
  '321': { allowed: false, name: 'Old Gregg'}
};

// for a more real-world validate function, see: https://git.io/vPZmr
var validate = function (decoded, request, callback) {
  if (db[decoded.id].allowed) {
    return callback(null, true);
  }
  else {
    return callback(null, false);
  }
};

// server.start(function (err) {
//   assert(!err);
//   server.log('info', 'Visit: ' + server.info.uri);
// });

module.exports = async () => {
  try {
    await server.register(require('../lib/index.js'));
    await server.register(require('vision'));
    await server.register(require('hapi-auth-jwt2'));
    await server.views({
      engines: {
        html: require('handlebars')
      },
      path: path.resolve(__dirname, '../example')
    });
    await server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT_SECRET,
      validate: validate
    });
    await server.route([
      { method: 'GET', path: '/throwerror', config: { auth: 'jwt' },
        handler: function throwerror (request, reply) {
          var err = true; // deliberately throw an error for https://git.io/vPZ4A
          return request.handleError(err, { errorMessage: 'Sorry, we haz fail.'});
        }
    }]);
    Hoek.assert('no errors registering plugins');
    return server;
  } catch (e) {
    throw e;
  }
};
;
