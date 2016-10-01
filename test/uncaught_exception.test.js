var test = require('tape');

test(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> GET /throw (uncaught exception)", function (t) {
  // t.plan(2);
  var throwserver = require('./uncaught_exception_server.js');
  var options = {
    method: 'GET',
    url: '/throw'
  };
  throwserver.inject(options, function(res){
    t.ok(res.payload.includes('AAAAA!'), 'Thrown Error Handled!');
    t.equal(res.statusCode, 500, ' >>>>>>>>>>>>> Got 500');
    t.end(throwserver.stop(function(){ console.log('stop throwserver') }));
  });
});

test.onFinish(function () {
  server.stop(function(){ }); // stop the hapi server after 500 error
});
