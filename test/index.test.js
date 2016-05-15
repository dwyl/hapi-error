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
    t.ok(res.payload.includes('hello'));
    t.equal(res.statusCode, 200);
    t.end();
  });
});

test("GET /500 returns 500 Error HTML Page", function (t) {
  var options = {
    method: 'GET',
    url: '/500'
  };
  server.inject(options, function(res){
    // console.log(res);
    t.ok(res.payload.includes('500'));
    t.equal(res.statusCode, 500);
    t.end();
  });
});

test("GET /500 with accept 'application/json' header", function (t) {
  var options = {
    method: 'GET',
    url: '/500',
    headers: { accept: 'application/json' }
  };
  server.inject(options, function(res){
    console.log(res.playload);
    // t.ok(res.payload.includes('500'));
    t.equal(res.statusCode, 500);
    t.end();
  });
});

test.onFinish(function () {
  server.stop(function(){ }); // stop the hapi server
})
