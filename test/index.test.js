var test = require('tape');
var server = require('../example/server_example');
var jwtserver = require('./jwt_server_example');
var redirectserver = require('./redirect_server_example');
var messageServer = require('./message_server_example');
var JWT    = require('jsonwebtoken');

/************************* handleError method test ***************************/

var handleError = require('../lib').handleError;

test("handleError no error is thrown when error = null", function (t) {
  var error = null;
  t.equal(handleError(error), undefined, 'No error thrown');
  t.end();
});

/************************* REDIRECT TEST ***************************/

test("GET /admin?hello=world should re-direct to /login?redirect=/admin?hello=world", function (t) {
  require('decache')('../lib/index.js'); // ensure we have a fresh module

  var options = {
    method: 'GET',
    url: '/admin?hello=world' // this will re-direct to /login
  };
  redirectserver.inject(options, function(res){
    // console.log(res);
    t.equal(res.statusCode, 302, 'statusCode: + ' + res.statusCode + ' (as expected)');
    var url = '/login?redirect=/admin?hello=world';
    t.equal(res.headers.location, url, 'Successfully redirected to: ' + url);
    t.end(  redirectserver.stop(function(){ }) );
  });
});

/** *********************** Message TEST ***************************/

test('example of overriding the', function (t) {
  var options = {
    method: 'GET',
    url: '/notfound'
  };

  messageServer.inject(options, function (res) {
    t.ok(res.payload.includes('robots in disguise'), '404 gets transformed');
    t.equal(res.statusCode, 404, 'statusCode give back ok');
    t.end();
  });
});

test('example of adding a new message transform which uses req', function (t) {
  var options = {
    method: 'GET',
    url: '/error'
  };

  messageServer.inject(options, function (res) {
    t.ok(res.payload.includes('User agent: shot'), 'Internal Server Error');
    t.equal(res.statusCode, 500, 'statusCode 500');
    t.end();
  });
});

test('close messageServer', function (t) {
  messageServer.stop(t.end);
});

/************************* Regular TESTS ***************************/

test("GET / returns 200", function (t) {
  var options = {
    method: 'GET',
    url: '/',
    headers: { accept: 'application/json' }
  };
  server.inject(options, function(res){
    // console.log(res);
    t.ok(res.payload.includes('hello'), 'No Errors');
    t.equal(res.statusCode, 200, 'statusCode 200');
    t.end();
  });
});

test("GET /login ", function (t) {
  var options = {
    method: 'GET',
    url: '/login',
    headers: { accept: 'application/json' }
  };
  server.inject(options, function(res) {
    t.equal(res.statusCode, 200, 'statusCode 200');
    t.ok(res.payload.includes('please login'), 'Please Login');
    t.end();
  });
});

test("GET /notfound returns 404", function (t) {
  var options = {
    method: 'GET',
    url: '/notfound'
  };
  server.inject(options, function(res){
    // console.log(res);
    t.ok(res.payload.includes('not available'), 'page not available');
    t.equal(res.statusCode, 404, 'statusCode 404');
    t.end();
  });
});

test("GET /admin expect to see 401 unauthorized error", function (t) {
  var options = {
    method: 'GET',
    url: '/admin'
  };
  server.inject(options, function(res){
    // console.log(res.playload);
    t.ok(res.payload.includes('Please Login'), 'Please login to see /admin');
    t.equal(res.statusCode, 401, 'statusCode 401');
    t.end();
  });
});

test("GET /error returns 500 Error HTML Page", function (t) {
  var options = {
    method: 'GET',
    url: '/error'
  };
  server.inject(options, function(res){
    // console.log(res);
    t.ok(res.payload.includes('500'), 'Internal Server Error');
    t.equal(res.statusCode, 500, 'statusCode 500');
    t.end();
  });
});

test("GET /error returns JSON when headers.accept 'application/json'", function (t) {
  var options = {
    method: 'GET',
    url: '/error',
    headers: { accept: 'application/json' }
  };
  server.inject(options, function(res){
    // console.log(res.payload, typeof res.payload);
    t.ok(res.payload.includes('Internal Server Error'), '500 Server Error');
    t.equal(res.statusCode, 500, 'Got statusCode 500 (as expected)');
    t.end();
  });
});

test("GET /register/username passes validation", function (t) {
  var options = {
    method: 'GET',
    url: '/register/username'
  };
  server.inject(options, function(res){
    t.ok(res.payload.includes('Hello username'), 'Passes validation');
    t.equal(res.statusCode, 200, 'statusCode 200');
    t.end(server.stop(function(){ }));
  });
});

test("GET /register/22%3A%5B%22black%22%5D%7D%22%3E%3C%7%203cript fails Joi validation", function (t) {
  var options = {
    method: 'GET',
    url: '/register/22%3A%5B%22black%22%5D%7D%22%3E%3C%7%203cript%3Ealert%281%29%3C%2fscript%3E'
  };
  server.inject(options, function(res){
    t.ok(res.payload.includes('Sorry'), 'Fails Joi validation');
    t.equal(res.statusCode, 400, 'intercepted error > 400');
    t.end(server.stop(function(){ }));
  });
});

test("GET /register/myscript fails additional (CUSTOM) validation", function (t) {
  var options = {
    method: 'GET',
    url: '/register/myscript?hello=world'
  };
  server.inject(options, function(res){
    t.ok(res.payload.includes('Sorry, that page is not available.'), 'Got Friendly 404 Page');
    t.equal(res.statusCode, 404, 'Got 404');
    t.end(server.stop(function(){ }));
  });
});

/************************* 'email' prop Available in Error Template/View ***************/

test("GET /error should display an error page containing the current person's email address", function (t) {
  require('decache')('../lib/index.js'); // ensure we have a fresh module
  var person = { id: 123, email: 'charlie@mail.me' }
  var token = JWT.sign(person, process.env.JWT_SECRET);

  var options = {
    method: 'GET',
    url: '/throwerror',
    headers: { authorization: "Bearer " + token }
  };
  jwtserver.inject(options, function(res) {
    // console.log(res);
    t.equal(res.statusCode, 500, 'statusCode: + ' + res.statusCode + ' (as expected)');
    // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - ');
    // console.log(res.payload);
    // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - ');
    t.equal(res.payload.includes(person.email), true, 'Email address displayed');
    t.end( jwtserver.stop(function(){ }) );
  });
});

test.onFinish(function () {
  server.stop(function(){ }); // stop the hapi server after 500 error
});
