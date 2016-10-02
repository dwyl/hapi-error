'use strict';

var pkg = require('../package.json'); // require package.json for attributes

/**
 * Takes a string and attempts to parse it as a JSON Object.
 * @param {String} str - a string which *may* be a JSON.stringified Object
 * @returns {Object|String} in the case where the str was a Stringified Object
 * we return the Object otherwise return the original string.
 * The purpose of this function is to avoid throwing a Parse Error.
 */
function tryJsonParse (str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return str;
  }

  return { object: JSON.parse(str) };
}

/**
 * register defines our errorHandler plugin following the standard hapi plugin
 * @param {Object} server - the server instance where the plugin is being used
 * @param {Object} options - any configuration options passed into the plugin
 * @param {Function} next - continuation function (callback) called on start
 * @returns {Function} reply.continue is called when the plugin is finished
 */
exports.register = function errorHandler (server, options, next) {
  // onPreResponse intercepts ALL errors
  server.ext('onPreResponse', function (request, reply) {
    var res = request.response;
    var req = request.raw.req;
    var msg = 'Sorry, something went wrong, please retrace your steps.';
    var statusCode = 200; // default to "success"
    var accept = request.raw.req.headers.accept;

    if (res.isBoom) {
      statusCode = res.output.payload.statusCode;
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

      // Header check, should take priority
      if (accept && accept.match(/json/)) { // support REST/JSON requests
        return reply(res.output.payload).code(statusCode);
      }
      // custom redirect https://github.com/dwyl/hapi-error/issues/5
      if (options && options[statusCode] && options[statusCode].redirect) {
        return reply.redirect(options[statusCode].redirect
          + '?redirect=' + request.url.path);
      }
      // this is the default error message:
      if (res.message && res.isDeveloperError) {
        msg = res.message.replace('Uncaught error: ', '');
      }
      switch (statusCode) {
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
      }

      return reply.view('error_template', {
        errorTitle: res.output.payload.error,
        statusCode: statusCode,
        errorMessage: msg
      }).code(statusCode); // e.g 401, 404 or 500 etc.
    }

    return reply.continue(); // continue processing the request
  });

  return next(); // continue with other plugins
};


exports.register.attributes = { pkg: pkg };
