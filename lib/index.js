/**
 * register defines our error_handler plugin
 */
exports.register = function error_handler(server, options, next) {
    // onPreResponse intercepts all errors
    server.ext('onPreResponse', function(request, reply) {
        var req = request.response;
        // console.log(request.response.message);
        // console.log(req);
        if (req.isBoom) {
            var accept = request.raw.req.headers.accept;
            var statusCode = req.output.payload.statusCode;
            // console.log(statusCode, typeof statusCode);
            if (accept && accept.match(/json/)) { // support REST/JSON requests
                return reply(req.output.payload).code(statusCode);
            } else { // this is the default error message:
                var msg = 'Sorry, something went wrong, please retrace your steps.';
                if (req.message && req.isDeveloperError) {
                    msg = req.message.replace('Uncaught error: ', '');
                }
                switch (statusCode) {
                    case 404:
                        msg = 'Sorry, that page is not available.';
                        break;
                    case 401:
                        msg = 'Please Login to view that page';
                        break;
                    default:
                        break;
                }

                msg = tryJsonParse(msg);

                if (msg.object) {
                    return reply.view('error_template', Object.assign(msg.object, {
                        errorTitle: req.output.payload.error,
                        statusCode: statusCode
                    })).code(statusCode);
                } else {
                    return reply.view('error_template', {
                        errorTitle: req.output.payload.error,
                        statusCode: statusCode,
                        errorMessage: msg,
                    }).code(statusCode); // e.g 401, 404 or 500 etc.
                }
            }
        }
        reply.continue();
    });
    next(); // continue with other plugins
};

function tryJsonParse(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return str;
  }
  return {
      object: JSON.parse(str)
  };
}

exports.register.attributes = {
    pkg: require('../package.json')
};
