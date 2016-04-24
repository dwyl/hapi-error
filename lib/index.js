/**
 * register defines our error_handler plugin
 */
exports.register = function error_handler (server, options, next) {

  server.ext('onPreResponse', function (request, reply) {
      var req = request.response;
      console.log(request.response);
      if (req.isBoom) {

        var statusCode = req.output.payload.statusCode
        console.log(req);
        return reply.view('error_template', {
          title: 'Server Error',
          statusCode: statusCode,
          errorName:  req.output.payload.error,
          errorMessage: 'Sorry, something went wrong, please retrace your steps.'
        })
        .code(statusCode);
      }
      reply.continue();
  });
  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
