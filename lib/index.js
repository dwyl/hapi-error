/**
 * register defines our error_handler plugin
 */
exports.register = function error_handler (server, options, next) {
  // onPreResponse intercepts all errors
  server.ext('onPreResponse', function (request, reply) {
    var req = request.response;
    if (req.isBoom) {
      var accept = request.raw.req.headers.accept;
      // console.log('accept >>', accept);
      var statusCode = req.output.payload.statusCode;
      if(accept && accept.match(/json/)) { // support REST/JSON requests
        return reply(req.output.payload).code(statusCode);
      } else {
        // console.log(req);
        return reply.view('error_template', {
          errorTitle: req.output.payload.error,
          statusCode: statusCode,
          errorMessage: 'Sorry, something went wrong, please retrace your steps.'
        }).code(statusCode); // e.g 401, 404 or 500 etc.
      }
    }
    reply.continue();
  });
  next(); // continue with other plugins
};

exports.register.attributes = {
  pkg: require('../package.json')
};
