var checkAuth = require('../middleware/checkAuth');

module.exports = function(app) {

  app.get('/', require('./frontpage').get);

  app.get('/login', require('./login').get);
    app.post('/login', require('./login').post);
    app.get('/signup', require('./signup').get);
    app.post('/signup', require('./signup').post);

  app.post('/logout', require('./logout').post);

  app.get('/game', checkAuth, require('./game').get);

};
