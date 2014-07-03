var nconf = require('nconf');
var path = require('path');

nconf.argv()
  .env()
  .file({ file: path.join(__dirname, 'config.json') });

nconf.stores.file.store.port = process.env.PORT || nconf.stores.file.store.port;

module.exports = nconf;