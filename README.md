# hapi-error

Intercept errors in your Hapi web app/api and send a *useful* message to the client.

## *Why*?

By default, `Hapi` does not give people *friendly* error messages.
This plugin/readme will show you how to display consistent, friendly & useful
error messages in your Hapi apps.

## *What*?

Under the hood, Hapi uses
[`Boom`](https://github.com/dwyl/learn-hapi#error-handling-with-boom)
to handle errors. These errors are returned as `JSON`. e.g:

If a URL/Endpoint does not exist a `404` is displayed:
![hapi-login-404-error](https://cloud.githubusercontent.com/assets/194400/14770263/06bdc6dc-0a65-11e6-9f9b-80944711a4f1.png)

When a person/client attmpts to access a "*restricted*" endpoint without
the proper authentication/authorisation a `401` error is shown:

![hapi-login-401-error](https://cloud.githubusercontent.com/assets/194400/14770276/57022f20-0a65-11e6-86de-d9b8e456b344.png)

And if an *unknown* error occurs on the server, a `500` error is *thrown*:

![localhost-500-error](https://cloud.githubusercontent.com/assets/194400/14770517/98a4b6d6-0a6b-11e6-8448-4b66e3df9a9a.png)

Our objective is to *re-purpose* the `Boom` errors and instead display human-friendly error *page*.


## *How*?

### 1. Install the [plugin](https://www.npmjs.com/package/hapi-error) from npm:

```sh
npm install hapi-error --save
```

### 2. Include the plugin in your Hapi project

Includ the plugin when you `register` your server:

```js
var Hapi = require('hapi');
var Path = require('path');
var Boom = require('boom');
var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8000 });

server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {
        reply('hello world');
      }
    }
  },
  {
    method: 'GET',
    path: '/error',
    config: {
      handler: function (request, reply) {
        reply(new Error('500'));
      }
    }
  }
]);
// this is where we include the hapi-error plugin:
server.register([require('hapi-error'), require('vision')], function (err) {
  if (err) {
    throw err;
  }
  server.views({
    engines: {
      html: require('handlebars') // or Jade or React etc.
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

module.exports = server;
```

> See: [/server_example.js]() for simple example

### 3. Ensure that you have a View called `error_template`

> Note: `hapi-error` plugin *expects* you are using [`Vision`](https://github.com/hapijs/vision) (*the standard view rendering library for Hapi apps*)
which allows you to use Handlebars, Jade, React, etc. for your templates.

### Implementation Detail:

When there is an error in the request/response cycle,
the Hapi `request` Object has *useful* error object we can use.

Try logging the `request.response` in one of your Hapi route handlers:

```js
console.log(request.response);
```
A typical `Boom` error has the format:
```js
{ [Error: 500]
  isBoom: true,
  isServer: true,
  data: null,
  output:
   { statusCode: 500,
     payload:
      { statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred' },
     headers: {} },
  reformat: [Function] }
```

The way to *intercept* this error is with a plugin that gets invoked
*before* the response is returned to the client.

A simple **Error Handler Plugin** *example*:

```js
/**
 * register defines our error_handler plugin
 */
exports.register = function error_handler (server, options, next) {
  // onPreResponse intercepts all errors
  server.ext('onPreResponse', function (request, reply) {
    var req = request.response;
    // console.log(request.response);
    if (req.isBoom) { // reply with a slightly more user-friendly error message
      return reply('Sorry, something went wrong, please retrace your steps.')
        .code(req.output.payload.statusCode);
    }
    reply.continue();
  });
  next(); // continue with other plugins
};

exports.register.attributes = {
  pkg: require('../package.json')
};
```
This is the basic setup for you can customise in your Hapi app.
*However* if you want a ["*turnkey*"](https://en.wikipedia.org/wiki/Turnkey)
plugin you can use in your project with user-friendly **HTML error pages**
(*when the client requests `HTML`*) and App/API-friendly **JSON error responses**
(*when the client asks for `JSON`*) then see the code in `/lib/index.js`
and usage instructions above!
