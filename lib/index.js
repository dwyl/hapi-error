'use strict';

var Hoek = require('@hapi/hoek');
var pkg = require('../package.json'); // require package.json for attributes

/**
 * isFunction checks if a given value is a function.
 * @param {Object} functionToCheck - the object we want to confirm is a function
 * @returns {Boolean} true|false
 */
function isFunction(functionToCheck) {
  const toString = Object.prototype.toString;
  return functionToCheck
    && toString.call(functionToCheck) === '[object Function]'
    || toString.call(functionToCheck) === '[object AsyncFunction]';
}

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
};


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
};
// export for use in files that do not have access to the request object
exports.handleError = handleError; // e.g. database-specific getters/setters

/**
 * register defines our errorHandler plugin following the standard hapi plugin
 * @param {Object} server - the server instance where the plugin is being used
 * @param {Object} options - any configuration options passed into the plugin
 * @returns {Function} reply.continue is called when the plugin is finished
 */
exports.plugin = {
  pkg: pkg,
  register: async function (server, options) {
    // creates config for handler to be used in 'onPreResponse' function
    var config = createConfig(options);

    // make handleError available on request
    server.ext('onRequest', function (request, reply) {
      request.handleError = handleError; // github.com/dwyl/hapi-error/issues/23

      return reply.continue;
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

          debug = {
            method: req.method, // e.g GET/POST
            url: request.url.path, // the path the person requested
            headers: request.raw.req.headers, // all HTTP Headers
            info: request.info, // all additional request info (useful to debug)
            auth: request.auth, // any authentication details e.g. decoded JWT
            payload: request.payload, // the complete request payload received
            response: res.output.payload, // response before error intercepted
            stackTrace: res.stack // the stack trace of the error
          };
          // ALWAYS Log the error
          server.log('error', debug); // github.com/dwyl/hapi-error/issues/22

          // Header check, should take priority
          if (accept && accept.match(/json/)) { // support REST/JSON requests
            return reply.response(res.output.payload).code(statusCode);
          }
          // custom redirect https://github.com/dwyl/hapi-error/issues/5
          var currentCodeConfig = config.statusCodes[statusCode];
          if (currentCodeConfig && currentCodeConfig.redirect) {
            // if redirect is function invoke it with the request object
            if (isFunction(currentCodeConfig.redirect)) {
              const url = currentCodeConfig.redirect(request)
              return reply.redirect(url);
            }
            else {
              // if parameter is string, append redirect query
              var redirectString = request.url.pathname + request.url.search;
              return reply.redirect(currentCodeConfig.redirect + '?redirect=' + redirectString);
            }
          }

          if (currentCodeConfig && currentCodeConfig.message) {
            msg = isFunction(currentCodeConfig.message)
              ? currentCodeConfig.message(msg, request)
              : currentCodeConfig.message
            ;
          }

          res = Object.assign(debug, {
            errorTitle: res.output.payload.error,
            statusCode: statusCode,
            errorMessage: msg
          });

          // next avoids TypeError if view rendering is not used in app e.g API!
          // see: https://github.com/dwyl/hapi-error/issues/49
          if (!reply.view) {
            return reply.response(res).code(statusCode);
          }

          return reply.view(config.templateName, res).code(statusCode); // e.g 401
        }; // end if (res.isBoom)
        return reply.continue; // continue processing the request
    });
  }
};
