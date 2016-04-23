var Hapi = require('hapi');
var Path = require('path');

var server = new Hapi.Server();
server.connection({ port: process.env.PORT });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply(new Error('500'));
    }
});

server.ext('onPreResponse', function (request, reply) {

    if (request.response.isBoom) {
        var err = request.response;
        var statusCode = err.output.payload.statusCode


        return reply.view('error_template', {
            title: 'Server Error',
            statusCode: statusCode,
            errorName:  err.output.payload.error,
            errorMessage: 'Sorry, Something went wrong, please retrace your steps.'
        })
        .code(statusCode);
    }
    reply.continue();
});


server.register(require('vision'), function (err) {

    if (err) {
        throw err;
    }
    server.views({
        engines: {
          html: require('handlebars')
        },
        path: Path.resolve(__dirname, './../lib')
    });

    server.start(function (err) {

        if (err) {
            throw err;
        }
        console.log('Visit:', server.info.uri);
    });
});
