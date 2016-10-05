module.exports = {
  ops: {
    interval: 30000 // reporting interval (30 seconds)
  },
  reporters: {
    myConsoleReporter: [{
    module: 'good-squeeze', // https://github.com/hapijs/good-squeeze
    name: 'Squeeze',
    args: [{ log: '*', error: '*', response: '*', request: '*', ops: '*' }]
    }, {
      module: 'good-console'
    }, 'stdout']
  }
}