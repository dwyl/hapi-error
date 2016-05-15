var test = require('tape');
var server = require('./server_example');

/************************* TESTS ***************************/
test("GET / shows a page with links", function (t) {
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

test.onFinish(function () {
  server.stop(function(){ }); // stop the hapi server
})
