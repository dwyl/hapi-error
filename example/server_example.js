var server = require('./server.js');
var Hoek   = require('hoek');

(async () => {

    await server.register(require('vision'));
    await server.register(require('../lib/index.js'));
    server.views({
        engines: {
            html: require('handlebars')
        },
        path: require('path').resolve(__dirname, './')
    });
    Hoek.assert(!err, 'no errors registering plugins');
  
    server.start(function (err) {
        Hoek.assert(!err, 'no errors starting server');
        server.log('info', 'Visit: ' + server.info.uri);
    });
})();

module.exports = server;
