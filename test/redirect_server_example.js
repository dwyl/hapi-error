require('decache')('../example/server.js'); // ensure we have a fresh module
var server = require('../example/server.js');
var Hoek = require('hoek');

var config = {
	"401": { // if the statusCode is 401 redirect to /login page/endpoint
		"redirect": "/login"
	}
}

server.register([{
    register: require('../lib/index.js'),
    options: config // pass in your redirect configuration in options
  },
  require('vision')], function (err) {
  Hoek.assert(!err, 'no errors registering plugins');
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: require('path').resolve(__dirname, '../example')
});

module.exports = server;
