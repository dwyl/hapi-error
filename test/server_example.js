var Hapi = require('hapi');
var Path = require('path');

var server = new Hapi.Server();
server.connection({ port: process.env.PORT });

server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {
        reply(new Error('500'));
      }
    }
});

// server.ext('onPreResponse', function (request, reply) {
//     var req = request.response;
//     console.log(request.response);
//     if (req.isBoom) {
//
//       var statusCode = req.output.payload.statusCode
//       console.log(req);
//       return reply.view('error_template', {
//         title: 'Server Error',
//         statusCode: statusCode,
//         errorName:  req.output.payload.error,
//         errorMessage: 'Sorry, something went wrong, please retrace your steps.'
//       })
//       .code(statusCode);
//     }
//     reply.continue();
// });


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
