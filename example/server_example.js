'use strict';

var server = require('./server.js');
var Hoek   = require('@hapi/hoek');

module.exports = async () => {
    try {
        await server.register(require('vision'));
        await server.register(require('../lib/index.js'));
        server.views({
            engines: {
                html: require('handlebars')
            },
            path: require('path').resolve(__dirname, './')
        });
        await server.start();
        server.log('info', 'Visit: ' + server.info.uri);
        Hoek.assert('no errors starting server');
        return server;
    } catch(e) {
        throw e;
    }
};
