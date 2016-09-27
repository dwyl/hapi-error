/**
 * register defines our error_handler plugin
 */
exports.register = function error_handler (server, options, next) {
  // onPreResponse intercepts ALL errors
  server.ext('onPreResponse', function (request, reply) {

    var res = request.response;
    var req = request.raw.req;
    // console.dir(request)

    if (res.isBoom) {
      // ALWAYS Log the error
      server.log('error', {
        method: req.method,
        url: request.url.path,
        headers: request.raw.req.headers,
        info: request.info,
        auth: request.auth,
        payload: request.payload,
        response: res.output.payload
      });

      var accept = request.raw.req.headers.accept;
      var statusCode = res.output.payload.statusCode;
      //Header check, should take priority
      if (accept && accept.match(/json/)) { // support REST/JSON requests
        return reply(res.output.payload).code(statusCode);
      }
      // custom redirect https://github.com/dwyl/hapi-error/issues/5
      else if(options && options[statusCode] && options[statusCode].redirect) {
        return reply.redirect(options[statusCode].redirect
          + '?redirect=' + request.url.path);
      }
      else { // this is the default error message:
        var msg = 'Sorry, something went wrong, please retrace your steps.';
        if (res.message && res.isDeveloperError) {
          msg = res.message.replace('Uncaught error: ', '');
        }
        switch(statusCode) {
          case 404:
            msg = 'Sorry, that page is not available.';
            break;
          case 401:
            msg = 'Please Login to view that page';
            break;
          case 400:
            // statusCode = 404; // over-ride error code?
            msg = 'Sorry, we do not have that page.';
            break;
          default:
            break;
        }

        msg = tryJsonParse(msg);

        if (msg.object) {
            return reply.view('error_template', Object.assign(msg.object, {
                errorTitle: res.output.payload.error,
                statusCode: statusCode
            })).code(statusCode);
        } else {
            return reply.view('error_template', {
                errorTitle: res.output.payload.error,
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


/**
 * tryJsonParse does what its name suggests accepts a string
 * and attempts to parse it as a JSON Object
 * @param {String} str - a string which *may* be a JSON.stringified Object
 * @returs {Object||String} in the case where the str was a Stringified Object,
 * we return the Object otherwise return the original string.
 * The purpose of this function is to avoid throwing a Parse Error.
 */
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
