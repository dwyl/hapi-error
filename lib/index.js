'use strict';

var Hoek = require('hoek');
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
 * Takes an error Object and Message and throws Hoek Error if not null
 * @param {String} error - error Object or null
 * @param {String|Object} errorMessage - Optional error message String or Object
 * @returns {Boolean} false.
 */
function handleError (error, errorMessage) {
  if (errorMessage) {
    return Hoek.assert(!error, errorMessage);
  }

  return Hoek.assert(!error, error);
}
// export for use in files that do not have access to the request object
exports.handleError = handleError; // e.g. database-specific getters/setters

/**
 * register defines our errorHandler plugin following the standard hapi plugin
 * @param {Object} server - the server instance where the plugin is being used
 * @param {Object} options - any configuration options passed into the plugin
 * @param {Function} next - continuation function (callback) called on start
 * @returns {Function} reply.continue is called when the plugin is finished
 */
exports.register = function hapiError (server, options, next) {
  // make handleError available on request
  server.ext('onRequest', function (request, reply) {
    request.handleError = handleError; // github.com/dwyl/hapi-error/issues/23

    return reply.continue();
  });

  // onPreResponse intercepts ALL errors
  server.ext('onPreResponse', function (request, reply) {
    var res = request.response;
    var req = request.raw.req;
    var msg = 'Sorry, something went wrong, please retrace your steps.';
    var statusCode = 200; // default to "success"
    var accept = request.raw.req.headers.accept;
    var debug; // defined here to keep JSLint Happy.

    if (res.isBoom) {
      statusCode = res.output.payload.statusCode;

      if (res.message && res.isDeveloperError) {
        msg = res.message.replace('Uncaught error: ', ''); // we caught it!
      }
      debug = {
        method: req.method, // e.g GET/POST
        url: request.url.path, // the path the person requested
        headers: request.raw.req.headers, // all HTTP Headers
        info: request.info, // all additional request info (useful for debug)
        auth: request.auth, // any authentication details e.g. the decoded JWT
        email: request.auth.credentials && request.auth.credentials.email
          ? request.auth.credentials.email : '', // see: https://git.io/vPZBK
        payload: request.payload, // the complete request payload received
        response: res.output.payload // response before error intercepted
      };
      // ALWAYS Log the error
      server.log('error', debug); // see: github.com/dwyl/hapi-error/issues/22

      // Header check, should take priority
      if (accept && accept.match(/json/)) { // support REST/JSON requests
        return reply(res.output.payload).code(statusCode);
      }
      // custom redirect https://github.com/dwyl/hapi-error/issues/5
      if (options && options[statusCode] && options[statusCode].redirect) {
        return reply.redirect(options[statusCode].redirect
          + '?redirect=' + request.url.path);
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

      if (msg.object) { // assiging the debug first lets dev override
        return reply.view('error_template', Object.assign(debug, msg.object, {
          errorTitle: res.output.payload.error,
          statusCode: statusCode
        })).code(statusCode);
      }

      return reply.view('error_template', Object.assign(debug, {
        errorTitle: res.output.payload.error,
        statusCode: statusCode,
        errorMessage: msg
      })).code(statusCode); // e.g 401, 404 or 500 etc.
    } // end if (res.isBoom)

    return reply.continue(); // continue processing the request
  });

  return next(); // continue with other plugins
};

exports.register.attributes = { pkg: pkg };
