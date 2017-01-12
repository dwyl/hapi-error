'use strict';

var Hoek = require('hoek');
var pkg = require('../package.json'); // require package.json for attributes

/**
 * Merges in custom options to teh default config for each status code
 * @param {Object} config - the custom option object with status codes as keys
 * and objects with settings as values
 * @returns {Object} config to be used in plugin with defaults overwritten
 * and or added to
 */
function createConfig (config) {
  var mergedConfig = {
    templateName: 'error_template',
    statusCodes: {
      401: { message: 'Please Login to view that page' },
      400: { message: 'Sorry, we do not have that page.' },
      404: { message: 'Sorry, that page is not available.' }
    }
  };

  // Target status code configuration objects.
  var statusCodes = config.statusCodes || config; // Backwards compatibility.

  // Configure error template name.
  mergedConfig.templateName = config.templateName || mergedConfig.templateName;

  Object.keys(statusCodes).forEach(function (statusCode) {
    if (!mergedConfig.statusCodes[statusCode]) {
      mergedConfig.statusCodes[statusCode] = {};
    }
    // Configure status code settings.
    Object.keys(statusCodes[statusCode]).forEach(function (setting) {
      mergedConfig.statusCodes[statusCode][setting]
        = statusCodes[statusCode][setting];
    });
  });

  return mergedConfig;
}

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
 * @param {String|Object} [errorMessage] - Optional error message String/Object
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
  // creates config for handler to be used in 'onPreResponse' function
  var config = createConfig(options);

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
        response: res.output.payload, // response before error intercepted
        stack_trace: res.stack // the stack trace of the error
      };
      // ALWAYS Log the error
      server.log('error', debug); // see: github.com/dwyl/hapi-error/issues/22

      // Header check, should take priority
      if (accept && accept.match(/json/)) { // support REST/JSON requests
        return reply(res.output.payload).code(statusCode);
      }
      // custom redirect https://github.com/dwyl/hapi-error/issues/5
      if (config.statusCodes[statusCode]
        && config.statusCodes[statusCode].redirect) {
        return reply.redirect(config.statusCodes[statusCode].redirect
          + '?redirect=' + request.url.path);
      }

      if (config.statusCodes[statusCode]
        && config.statusCodes[statusCode].message) {
        msg = typeof config.statusCodes[statusCode].message === 'function'
          ? config.statusCodes[statusCode].message(msg, request)
          : config.statusCodes[statusCode].message
        ;
      }

      msg = tryJsonParse(msg);

      if (msg.object) { // assiging the debug first lets dev override
        return reply.view(config.templateName,
          Object.assign(debug, msg.object, {
            errorTitle: res.output.payload.error,
            statusCode: statusCode
          })).code(statusCode);
      }

      return reply.view(config.templateName, Object.assign(debug, {
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
