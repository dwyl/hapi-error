require('decache')('./server.js'); // ensure we have a fresh module
var server = require('./server.js');
var Hoek = require('hoek');

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
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: require('path').resolve(__dirname, './')
});

module.exports = server;
