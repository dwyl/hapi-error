/**
 * register defines our error_handler plugin
 */
exports.register = function error_handler (server, options, next) {
  // onPreResponse intercepts all errors
  server.ext('onPreResponse', function (request, reply) {
    var req = request.response;
    if (req.isBoom) {
      var accept = request.raw.req.headers.accept;
      var statusCode = req.output.payload.statusCode;
      // console.log(statusCode, typeof statusCode);
      if(accept && accept.match(/json/)) { // support REST/JSON requests
        return reply(req.output.payload).code(statusCode);
      } else { // this is the default error message:
        var msg = 'Sorry, something went wrong, please retrace your steps.';
        switch(statusCode) {
          case 404:
            msg = 'Sorry, that page is not available.';
            break;
          case 401:
            msg = 'Please Login to view that page';
            break;
        }
        return reply.view('error_template', {
          errorTitle: req.output.payload.error,
          statusCode: statusCode,
          errorMessage: msg,
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
