'use strict';

var test = require('tape-async');
var JWT    = require('jsonwebtoken');

/************************* handleError method test ***************************/

var handleError = require('../lib').handleError;

test("handleError no error is thrown when error = null", function (t) {
  var error = null;
  t.equal(handleError(error), undefined, 'No error thrown');
  t.end();
});

test("handleError don't throw error even if errorMessage is set", function (t) {
  var error = null;
  t.equal(handleError(error, 'this will not throw!'), undefined, 'No error thrown');
  t.end();
});


/************************* REDIRECT TEST ***************************/
test('Initializing redirect_server_example', async function (t) {
  require('decache')('../example/server.js');
  var redirectserver = await require('./redirect_server_example')();
  test("GET /admin?hello=world should re-direct to /login?redirect=/admin?hello=world", async function (t) {
    require('decache')('../lib/index.js'); // ensure we have a fresh module
    const options = {
      method: 'GET',
      url: '/admin?hello=world' // this will re-direct to /login
    };
    const res = await redirectserver.inject(options);
    t.equal(res.statusCode, 302, 'statusCode: + ' + res.statusCode + ' (as expected)');
    const url = '/login?redirect=/admin?hello=world';
    t.equal(res.headers.location, url, 'Successfully redirected to: ' + url);
    t.end(await redirectserver.stop());
  });

  test("GET /management?hello=world should re-direct to /login?redirect=/management?hello=world", async function (t) {
    require('decache')('../lib/index.js'); // ensure we have a fresh module

    var options = {
      method: 'GET',
      url: '/management?hello=world' // this will re-direct to /login
    };
    const res = await redirectserver.inject(options);
    t.equal(res.statusCode, 302, 'statusCode: + ' + res.statusCode + ' (as expected)');
    const url = '/login?redirect=/management?hello=world';
    t.equal(res.headers.location, url, 'Successfully redirected to: ' + url);
    t.end(await redirectserver.stop());
  });

  test("GET /management?hello=world should not re-direct on redirect function returning false", async function (t) {
    require('decache')('../lib/index.js'); // ensure we have a fresh module

    const options = {
      method: 'GET',
      url: '/management?hello=world&noredirect=1' // this will prevent re-direction
    };
    const res = await redirectserver.inject(options);
    t.equal(res.statusCode, 403, 'statusCode should be the original 403');
    t.end(await redirectserver.stop());
  });
})

/************************* Message TEST ***************************/
test('Initializing message_server_example', async function (t) {
  try {
    require('decache')('../example/server.js');
    var messageServer = await require('./message_server_example')();
    test('example of overriding the', async function (t) {
      var options = {
        method: 'GET',
        url: '/notfound'
      };
      const res = await messageServer.inject(options);
      t.ok(res.payload.includes('robots in disguise'), '404 gets transformed');
      t.equal(res.statusCode, 404, 'statusCode give back ok');
      t.end();
    });

    test('example of adding a new message transform which uses req',async function (t) {
      var options = {
        method: 'GET',
        url: '/error'
      };

      const res = await messageServer.inject(options);
      t.ok(res.payload.includes('User agent: shot'), 'Internal Server Error');
      t.equal(res.statusCode, 500, 'statusCode 500');
      t.end();
    });

    test('close messageServer',async function (t) {
      messageServer.stop(t.end);
    });
  } catch (e) {
    throw e;
  }
});

/************************* Regular TESTS ***************************/
test('Initializing server_example', async function (t) {
  require('decache')('../example/server.js');
  var server = await require('../example/server_example')();
  test("GET / returns 200",async function (t) {
    var options = {
      method: 'GET',
      url: '/',
      headers: { accept: 'application/json' }
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('hello'), 'No Errors');
    t.equal(res.statusCode, 200, 'statusCode 200');
    t.end();
  });

  test("GET /login ",async function (t) {
    var options = {
      method: 'GET',
      url: '/login',
      headers: { accept: 'application/json' }
    };
    const res = await server.inject(options);
    t.equal(res.statusCode, 200, 'statusCode 200');
    t.ok(res.payload.includes('please login'), 'Please Login');
    t.end();
  });

  test("GET /notfound returns 404",async function (t) {
    var options = {
      method: 'GET',
      url: '/notfound'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('not available'), 'page not available');
    t.equal(res.statusCode, 404, 'statusCode 404');
    t.end();
  });

  test("GET /admin expect to see 401 unauthorized error",async function (t) {
    var options = {
      method: 'GET',
      url: '/admin'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Please Login'), 'Please login to see /admin');
    t.equal(res.statusCode, 401, 'statusCode 401');
    t.end();
  });

  test("GET /error returns 500 Error HTML Page",async function (t) {
    var options = {
      method: 'GET',
      url: '/error'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('500'), 'Internal Server Error');
    t.equal(res.statusCode, 500, 'statusCode 500');
    t.end();
  });

  test("GET /error returns JSON when headers.accept 'application/json'",async function (t) {
    var options = {
      method: 'GET',
      url: '/error',
      headers: { accept: 'application/json' }
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Internal Server Error'), '500 Server Error');
    t.equal(res.statusCode, 500, 'Got statusCode 500 (as expected)');
    t.end();
  });

  test("GET /register/username passes validation",async function (t) {
    var options = {
      method: 'GET',
      url: '/register/username'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Hello username'), 'Passes validation');
    t.equal(res.statusCode, 200, 'statusCode 200');
    t.end(await server.stop());
  });

  test("GET /register/22%3A%5B%22black%22%5D%7D%22%3E%3C%7%203cript fails Joi validation",async function (t) {
    var options = {
      method: 'GET',
      url: '/register/22%3A%5B%22black%22%5D%7D%22%3E%3C%7%203cript%3Ealert%281%29%3C%2fscript%3E'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Sorry'), 'Fails Joi validation');
    t.equal(res.statusCode, 400, 'intercepted error > 400');
    t.end(await server.stop());
  });

  test("GET /register/myscript fails additional (CUSTOM) validation",async function (t) {
    var options = {
      method: 'GET',
      url: '/register/myscript?hello=world'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Sorry, that page is not available.'), 'Got Friendly 404 Page');
    t.equal(res.statusCode, 404, 'Got 404');
    t.end(await server.stop());
  });
  test.onFinish(async function () {
    server.stop(); // stop the hapi server after 500 error
  });
  
});

/************************* 'email' prop Available in Error Template/View ***************/
test('Initializing server', async function (t) {
  require('decache')('../example/server.js');
  var jwtserver = await require('./jwt_server_example')();
  test("GET /error should display an error page containing the current person's email address",async function (t) {
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
});

/************************* API (no vision) Tests ***************************/
test('Initializing api_server', async function (t) {
  require('decache')('../example/server.js');
  var apiServer = await require('./api_server.js')();

  test('regression test for #49 (when no vison views configured)',async function (t) {
    const res = await apiServer.inject({ url: '/error' });
    t.equal(res.statusCode, 404, 'statusCode give back ok');
    t.end(await apiServer.stop());
  });
});

