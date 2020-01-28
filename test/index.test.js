'use strict';

const test = require('tape-async');
const JWT = require('jsonwebtoken');
const decache = require('decache');

/************************* handleError method test ***************************/

const handleError = require('../lib').handleError;

test("handleError no error is thrown when error = null", function (t) {
  const error = null;
  t.equal(handleError(error), undefined, 'No error thrown');
  t.end();
});

test("handleError don't throw error even if errorMessage is set", function (t) {
  const error = null;
  t.equal(handleError(error, 'this will not throw!'), undefined, 'No error thrown');
  t.end();
});

/************************* REDIRECT TEST ***************************/
const redirectServerExampleLocation = './redirect_server_example';

test("GET /admin?hello=world should re-direct to /login?redirect=/admin?hello=world", async function (t) {
  decache(redirectServerExampleLocation);
  const redirectServer = await require(redirectServerExampleLocation)();

  const urlWithQuery = '/admin?hello=world';
  const combinedUrl = '/login?redirect=/admin?hello=world';

  const options = {
    method: 'GET',
    url: urlWithQuery // this will re-direct to /login
  };

  const res = await redirectServer.inject(options);
  t.equal(res.statusCode, 302, 'statusCode: + ' + res.statusCode + ' (as expected)');
  t.equal(res.headers.location, combinedUrl, 'Successfully redirected to: ' + combinedUrl);
  t.end( await redirectServer.stop() );
});

test("GET /management?hello=world should re-direct to /login?redirect=/management?hello=world", async function (t) {
  decache(redirectServerExampleLocation);
  const redirectServer = await require(redirectServerExampleLocation)();

  const urlWithQuery = '/management?hello=world';
  const combinedUrl = '/login?redirect=/management?hello=world';

  const options = {
    method: 'GET',
    url: urlWithQuery // this will re-direct to /login
  };

  const res = await redirectServer.inject(options);
  t.equal(res.statusCode, 302, 'statusCode: + ' + res.statusCode + ' (as expected)');
  t.equal(res.headers.location, combinedUrl, 'Successfully redirected to: ' + combinedUrl);
  t.end( await redirectServer.stop() );
});

/************************* Message TEST ***************************/
test('Initializing message_server_example', async function (t) {
  try {
    decache('../example/server.js');
    const messageServer = await require('./message_server_example')();
    test('example of overriding the', async function (t) {
      const options = {
        method: 'GET',
        url: '/notfound'
      };

      const res = await messageServer.inject(options);
      t.ok(res.payload.includes('robots in disguise'), '404 gets transformed');
      t.equal(res.statusCode, 404, 'statusCode give back ok');
      t.end();
    });

    test('example of adding a new message transform which uses req',async function (t) {
      const options = {
        method: 'GET',
        url: '/error'
      };

      const res = await messageServer.inject(options);
      t.ok(res.payload.includes('User agent: shot'), 'Internal Server Error');
      t.equal(res.statusCode, 500, 'statusCode 500');
      t.end();
    });

    test('close messageServer', async function (t) {
      await messageServer.stop();
      t.end()
    });
  } catch (e) {
    throw e;
  }
});

// /************************* Regular TESTS ***************************/
test('Initializing server_example', async function (t) {
  decache('../example/server.js');
  const server = await require('../example/server_example')();

  test("GET / returns 200",async function (t) {
    const options = {
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
    const options = {
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
    const options = {
      method: 'GET',
      url: '/notfound'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('not available'), 'page not available');
    t.equal(res.statusCode, 404, 'statusCode 404');
    t.end();
  });

  test("GET /admin expect to see 401 unauthorized error",async function (t) {
    const options = {
      method: 'GET',
      url: '/admin'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Please Login'), 'Please login to see /admin');
    t.equal(res.statusCode, 401, 'statusCode 401');
    t.end();
  });

  test("GET /error returns 500 Error HTML Page",async function (t) {
    const options = {
      method: 'GET',
      url: '/error'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('500'), 'Internal Server Error');
    t.equal(res.statusCode, 500, 'statusCode 500');
    t.end();
  });

  test("GET /error returns JSON when headers.accept 'application/json'",async function (t) {
    const options = {
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
    const options = {
      method: 'GET',
      url: '/register/username'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Hello username'), 'Passes validation');
    t.equal(res.statusCode, 200, 'statusCode 200');
    t.end();
  });

  test("GET /register/22%3A%5B%22black%22%5D%7D%22%3E%3C%7%203cript fails Joi validation",async function (t) {
    const options = {
      method: 'GET',
      url: '/register/22%3A%5B%22black%22%5D%7D%22%3E%3C%7%203cript%3Ealert%281%29%3C%2fscript%3E'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Sorry'), 'Fails Joi validation');
    t.equal(res.statusCode, 400, 'intercepted error > 400');
    t.end();
  });

  test("GET /register/myscript fails additional (CUSTOM) validation",async function (t) {
    const options = {
      method: 'GET',
      url: '/register/myscript?hello=world'
    };
    const res = await server.inject(options);
    t.ok(res.payload.includes('Sorry, that page is not available.'), 'Got Friendly 404 Page');
    t.equal(res.statusCode, 404, 'Got 404');
    t.end();
  });

  server.stop()
});

// /************************* 'email' prop Available in Error Template/View ***************/
test('Initializing server', async function (t) {
  decache('./jwt_server_example');
  const jwtserver = await require('./jwt_server_example')();

  test("GET /error should display an error page containing the current person's email address",async function (t) {
    decache('../lib/index.js'); // ensure we have a fresh module
    const person = { id: 123, email: 'charlie@mail.me' }
    const token = JWT.sign(person, process.env.JWT_SECRET);

    const options = {
      method: 'GET',
      url: '/throwerror',
      headers: { authorization: "Bearer " + token }
    };

    const res = await jwtserver.inject(options);
    t.equal(res.statusCode, 500, 'statusCode: + ' + res.statusCode + ' (as expected)');
    jwtserver.stop();
    t.end();
  });
});

// /************************* API (no vision) Tests ***************************/
test('Initializing api_server', async function (t) {
  decache('./api_server.js');
  const apiServer = await require('./api_server.js')();

  test('regression test for #49 (when no vison views configured)', async function (t) {
    const options = { url: '/error' };

    const res = await apiServer.inject(options);
    t.equal(res.statusCode, 404, 'statusCode give back ok');
    apiServer.stop();
    t.end();
  });
});
