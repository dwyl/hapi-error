var test = require('tape');
var handleError = require('../lib').handleError;

test("handleError no error is thrown when error = null", function (t) {
	var error = null;
	t.equal(handleError(error), undefined, 'No error thrown');
	t.end();
});

