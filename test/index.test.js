var test = require('tape');
var server = require('../example/server_example');

/************************* REDIRECT TEST ***************************/
test("GET /admin?hello=world should re-direct to /login?redirect=/admin?hello=world", function (t) {

  require('decache')('../lib/index.js'); // ensure we have a fresh module
  var redirectserver = require('./redirect_server_example');

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
    t.equal(res.statusCode, 500);
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

test("GET /hoek returns 'Boom Goes the Dynamite!'", function (t) {
  var options = {
    method: 'GET',
    url: '/hoek'
  };
  server.inject(options, function(res){
    t.ok(res.payload.includes('Boom Goes the Dynamite!'), 'Custom Error Messages!');
    t.equal(res.statusCode, 500, 'statusCode 500');
    t.end();
  });
});

test("GET /hoek-object returns message and extra email handlebar prop", function (t) {
  var options = {
    method: 'GET',
    url: '/hoek-object'
  };
  server.inject(options, function(res){
    t.ok(res.payload.includes('Oops - there has been an error'), 'Correct Custom Error Messages!');
    t.ok(res.payload.includes('test@test.test', 'Extra email handlebar prop displayed'));
    t.equal(res.statusCode, 500, 'statusCode 500');
    t.end();
  });
});



test.onFinish(function () {
  server.stop(function(){ }); // stop the hapi server after 500 error
});
