# hapi-error

Intercept errors in your Hapi web app/api and send a *useful* message to the client.

[![Build Status](https://travis-ci.org/dwyl/hapi-error.svg?branch=master)](https://travis-ci.org/dwyl/hapi-error)
[![Test Coverage](https://img.shields.io/codecov/c/github/dwyl/hapi-error.svg?maxAge=2592000)](https://codecov.io/github/dwyl/hapi-error?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-goodparts-brightgreen.svg)](https://github.com/dwyl/goodparts)
[![Code Climate](https://codeclimate.com/github/dwyl/hapi-error/badges/gpa.svg)](https://codeclimate.com/github/dwyl/hapi-error)
[![Dependency Status](https://david-dm.org/dwyl/hapi-error.svg)](https://david-dm.org/dwyl/hapi-error)
[![devDependencies Status](https://david-dm.org/dwyl/hapi-error/dev-status.svg)](https://david-dm.org/dwyl/hapi-error?type=dev)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/hapi-error/issues)
[![npm package version](https://img.shields.io/npm/v/hapi-error.svg)](https://www.npmjs.com/package/hapi-error)


![dilbert-404-error](https://cloud.githubusercontent.com/assets/194400/17856406/53feeee4-6875-11e6-8480-d493906f6aa1.png)


## *Why*?

> #### Seeing an (_unhelpful/unfriendly_) error message is _by far_ the _most frustrating_ part of the "**User _Experience_**" (**UX**) of your web app/site.

Most _non-technical_ people (_"average" web users_) have _no clue_
what a `401` error is. And if you/we the developer(s) do not _communicate_ with them, it can quickly lead to confusion and
[_abandonment_](https://en.wikipedia.org/wiki/Abandonment_rate)!
If instead of simply displaying **`401`** we _inform_ people:
`"Please login to see that page."` we _**instantly improve**_
the **UX** and thus make that person's day/life better. :heart:

> _The "**Number 1 Rule**" is to make sure your **error messages**
sound like they’ve been **written for/by humans**_.
[~ _The **Four H**'s of Writing Error Messages_](http://uxmas.com/2012/the-4-hs-of-writing-error-messages)

## *What*?

By `default`, `Hapi` does _not_ give people *friendly* error messages.

`hapi-error` is a plugin that lets your Hapi app display _consistent_, _**human-friendly**_ & *useful*
error messages so the _people_ using your app
[_don't panic_](https://en.wikipedia.org/wiki/Phrases_from_The_Hitchhiker%27s_Guide_to_the_Galaxy#Don.27t_Panic).

> Try it: http://hapi-error.herokuapp.com/panacea


Under the hood, Hapi uses
[`Boom`](https://github.com/dwyl/learn-hapi#error-handling-with-boom)
to handle errors. These errors are returned as `JSON`. e.g:

If a URL/Endpoint does not exist a `404` error is returned:  
![hapi-login-404-error](https://cloud.githubusercontent.com/assets/194400/14770263/06bdc6dc-0a65-11e6-9f9b-80944711a4f1.png)

When a person/client attempts to access a "*restricted*" endpoint without
the proper authentication/authorisation a `401` error is shown:

![hapi-login-401-error](https://cloud.githubusercontent.com/assets/194400/14770276/57022f20-0a65-11e6-86de-d9b8e456b344.png)

And if an *unknown* error occurs on the server, a `500` error is *thrown*:

![localhost-500-error](https://cloud.githubusercontent.com/assets/194400/14770517/98a4b6d6-0a6b-11e6-8448-4b66e3df9a9a.png)

The `hapi-error` plugin *re-purposes* the `Boom` errors (*both the standard Hapi errors and your custom ones*) and instead display human-friendly error *page*:

![hapi-error-screens](https://cloud.githubusercontent.com/assets/194400/15275274/ef9e5402-1abe-11e6-9313-71b11c61f032.png)

> ***Note***: *super basic error page example is just what we came up with in a few minutes, you have full control over what your error page looks like, so use your imagination*!

> ***Note***: if the client expects a JSON response simply define
that in the `headers.accept` and it will still receive the JSON error messages.


## *How*?

> **Note**: If you (_or anyone on your team_) are _unfamiliar_ with **Hapi.js** we have a
quick guide/tutorial to help get you started: [https://github.com/dwyl/**learn-hapi**](https://github.com/dwyl/learn-hapi)

Error handling in 3 *easy* steps:

### 1. Install the [plugin](https://www.npmjs.com/package/hapi-error) from NPM:

```sh
npm install hapi-error --save
```

### 2. Include the plugin in your Hapi project

Include the plugin when you `register` your `server`:

```js
var Hapi = require('hapi');
var Path = require('path');
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
      html: require('handlebars') // or Jade or Riot or React etc.
    },
    path: Path.resolve(__dirname, '/your/view/directory')
  });

  server.start(function (err) {
    if (err) {
      throw err; // if there's an error exit!
    }
    console.log('Visit:', server.info.uri);
  });
});

module.exports = server;
```

> See: [/example/server_example.js](https://github.com/dwyl/hapi-error/blob/master/example/server_example.js) for simple example

### 3. Create an Error View Template

The default template name is `error_template` and is expected to exist, but can be configured in the options:

```js
const config = {
  templateName: 'my-error-template'
};
```

> Note: `hapi-error` plugin *expects* you are using [`Vision`](https://github.com/hapijs/vision) (*the standard view rendering library for Hapi apps*)
which allows you to use Handlebars, Jade, [**Riot**](https://github.com/dwyl/hapi-riot), React, etc. for your templates.

Your `templateName` (*or `error_template.ext` `error_template.tag` `error_template.jsx`*) should make use of the 3 variables it will be passed:

+ `errorTitle` - *the error tile generated by Hapi*
+ `statusCode` - *HTTP statusCode sent to the client *e.g: `404`* (*not found*)
+ `errorMessage` - the *human-friendly error message*

> for an example see: [`/example/error_template.html`](https://github.com/dwyl/hapi-error/blob/master/example/error_template.html)

### 4. *Optional* Add `statusCodes` config object to transform messages or redirect for certain status codes

Each status code can be given two properties `message` and `redirect`.

The default config object for status codes:
```
const config = {
  statusCodes: {
    401: { message: 'Please Login to view that page' },
    400: { message: 'Sorry, we do not have that page.' },
    404: { message: 'Sorry, that page is not available.' }
  }
};
```
We want to provide useful error messages that are pleasant for the user. If you think there are better defaults for messages or other codes then do let us know via [issue](https://github.com/dwyl/hapi-error/issues).

Any of the above can be overwritten and new status codes can be added.

#### `message` Parse/replace the error message

This parameter can be of the form `function(message, request)` or just simply a `'string'` to replace the message.

An example of a use case would be handling errors form joi validation.

Or erroring in different languages.
```js
const config = {
  statusCodes: {
    "401": {
      "message": function(msg, req) {
        var lang = findLang(req);

        return translate(lang, message);
      }
    }
  }
};
```

Or providing nice error messages like in the default config above.

#### `redirect` *Redirecting* to another endpoint

Sometimes you don't _want_ to show an error page;
_instead_ you want to re-direct to another page.
For example, when your route/page requires the person
to be authenticated (_logged in_), but they have
not supplied a valid session/token to view the route/page.

In this situation the default Hapi behaviour is to return a `401` (_unauthorized_) error,
however this is not very _useful_ to the _person_ using your application.

Redirecting to a specific url is _easy_ with `hapi-error`:

```js
const config = {
  statusCodes: {
    "401": { // if the statusCode is 401
      "redirect": "/login" // redirect to /login page/endpoint
    }
  }
}
server.register([{
    register: require('hapi-error'),
    options: config // pass in your redirect configuration in options
  },
  require('vision')], function (err) {
    // etc.
});  
```

This will `redirect` the client/browser to the `/login` endpoint
and will append a query parameter with the url the person was _trying_ to visit.

e.g: GET /admin --> 401 unauthorized --> redirect to /login?redirect=/admin

> Redirect Example: [/redirect_server_example.js](https://github.com/dwyl/hapi-error/blob/master/test/redirect_server_example.js)


## *That's it*!

*Want more...?* [*ask*!](https://github.com/dwyl/hapi-error/issues)

## *Custom* Error Messages using `request.handleError`

When you `register` the `hapi-error` plugin a _useful_ `handleError` method
becomes available in every request handler which allows you to (_safely_)
"handle" any "*thrown*" errors using just one line of code.

Consider the following Hapi route handler code that is fetching data from a generic Database:

```js
function handler (request, reply) {
  db.get('yourkey', function (err, data) {
    if (err) {
      return reply('error_template', { msg: 'A database error occurred'});
    } else {
      return reply('amazing_app_view', {data: data});
    }
  });
}
```
This can be re-written (*simplified*) using `request.handleError` method:

```js
function handler (request, reply) {
  db.get('yourkey', function (err, data) { // much simpler, right?
    request.handleError(err, 'A database error occurred');
    return reply('amazing_app_view', {data: data});
  }); // this has *exactly* the same effect in much less code.
}
```
Output:

![hapi-error-a-database-error-occured](https://cloud.githubusercontent.com/assets/194400/19078231/590d2d80-8a47-11e6-82e2-742d193b43b9.png)

#### Explanation:

Under the hood, `request.handleError` is using `Hoek.assert` which
will `assert` that there is ***no error*** e.g:

`Hoek.assert(!err, 'A database error occurred');`

Which means that if there *is* an error, it will be "*thrown*"
with the message you define in the *second argument*.

<br />

### `handleError` _everywhere_

> Need to call `handleError` _outside_ of the context of the `request` ?

Sometimes we create handlers that perform a task _outside_ of the context of
a route/handler (_e.g accessing a database or API_) in this context
we still want to use `handleError` to simplify error handling.

This is easy with `hapi-error`, here's an example:

```js
var handleError = require('hapi-error').handleError;

db.get(key, function (error, result) {
  handleError(error, 'Error retrieving ' + key + ' from DB :-( ');
  return callback(err, result);
});
```
or in a file operation (_uploading a file to AWS S3_):

```js
var handleError = require('hapi-error').handleError;

s3Bucket.upload(params, function (err, data) {
  handleError(error, 'Error retrieving ' + key + ' from DB :-( ');
  return callback(err, result);
}
```

Provided the `handleError` is called from a function/helper
that is being _run_ by a Hapi server any errors will be _intercepted_
and _logged_ and displayed (_nicely_) to people using your app.

### _custom_ data in error pages

> Want/need to pass some more/custom data to display in your `error_template` view?

All you have to do is pass an object to `request.handleError` with an
errorMessage property and any other template properties you want!

For example:  
```js
request.handleError(!error, {errorMessage: 'Oops - there has been an error',
email: 'example@mail.co', color:'blue'});
```
You will then be able to use {{email}} and {{color}} in your `error_template.html`

### logging

As with _all_ hapi apps/APIs the recommended approach to logging
is to use [`good`](https://github.com/dwyl/learn-hapi#logging-with-good)

`hapi-error` logs all errors using `server.log` (_the standard way of logging in Hapi apps_) so once you enable `good` in your app you will _see_ any errors in your logs.

e.g:  
![hapi-error-log](https://cloud.githubusercontent.com/assets/194400/19013932/f2471060-87d6-11e6-980a-d7210c9fea7e.png)

### Debugging

If you need more debugging in your error template, `hapi-error` exposes _several_
useful properties which you can use.

```js
{
  "method":"GET",
  "url":"/your-endpoint",
  "headers":{
    "authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJlbWFpbCI6ImhhaUBtYWlsLm1lIiwiaWF0IjoxNDc1Njc0MDQ2fQ.Xc6nCPQW4ZSf9jnIIs8wYsM4bGtvpe8peAxp6rq4y0g",
    "user-agent":"shot",
    "host":"http://yourserver:3001"
  },
  "info":{
    "received":1475674046045,
    "responded":0,
    "remoteAddress":"127.0.0.1",
    "remotePort":"",
    "referrer":"",
    "host":"http://yourserver:3001",
    "acceptEncoding":"identity",
    "hostname":"http://yourserver:3001"
  },
  "auth":{
    "isAuthenticated":true,
    "credentials":{
       "id":123,
       "email":"hai@mail.me",
       "iat":1475674046
    },
    "strategy":"jwt",
    "mode":"required",
    "error":null,
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJlbWFpbCI6ImhhaUBtYWlsLm1lIiwiaWF0IjoxNDc1Njc0MDQ2fQ.Xc6nCPQW4ZSf9jnIIs8wYsM4bGtvpe8peAxp6rq4y0g"
  },
  "email":"hai@mail.me",
  "payload":null,
  "response":{
    "statusCode":500,
    "error":"Internal Server Error",
    "message":"An internal server error occurred"
  }
}
```

All the properties which are logged by `hapi-error` are available in
your error template.

### Are Query Parameters Preserved?

***Yes***! e.g: if the original url is `/admin?sort=desc`
the redirect url will be: `/login?redirect=/admin?sort=desc`
Such that after the person has logged in they will be re-directed
back to to `/admin?sort=desc` _as desired_.

And it's valid to have multiple question marks in the URL see:
http://stackoverflow.com/questions/2924160/is-it-valid-to-have-more-than-one-question-mark-in-a-url
so the query is preserved and can be used to send the person
to the _exact_ url they requested _after_ they have successfully logged in.

<br />

### Under the Hood (_Implementation Detail_):

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

See: [lib/index.js](https://github.com/dwyl/hapi-error/blob/master/lib/index.js)
for details on how the plugin is implemented.

If you have _any_ questions, just [*ask*!](https://github.com/dwyl/hapi-error/issues)


## Background Reading & Research

+ Writing *useful* / *friendly* error messages:
https://medium.com/@thomasfuchs/how-to-write-an-error-message-883718173322

[![https://nodei.co/npm/hapi-error.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/hapi-error.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/hapi-error)
[![HitCount](https://hitt.herokuapp.com/dwyl/hapi-error.svg)](https://github.com/dwyl/hapi-error)
