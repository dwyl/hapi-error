var test = require('tape');
var server = require('./server_example');

/************************* TESTS ***************************/
test("GET / returns 500 Error HTML Page", function (t) {
  var options = {
    method: 'GET',
    url: '/'
  };
  server.inject(options, function(res){
    console.log(res);
    t.ok(res.payload.includes('500'));
    t.equal(res.statusCode, 500);
    t.end();
  });
});

test.onFinish(function () {
  server.stop(function(){ }); // stop the hapi server
})
