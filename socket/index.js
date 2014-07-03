var log = require('../lib/log')(module);
var config = require('../config');
var connect = require('connect'); // npm i connect
var async = require('async');
var cookie = require('cookie');   // npm i cookie
var sessionStore = require('../lib/sessionStore');
var HttpError = require('../error').HttpError;
var User = require('../models/user').User;
var sanitizer = require('sanitizer');
var _ = require('lodash');

function loadSession(sid, callback) {

    // sessionStore callback is not quite async-style!
    sessionStore.load(sid, function (err, session) {
        if (arguments.length == 0) {
            // no arguments => no session
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });

}

function loadUser(session, callback) {

    if (!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return callback(null, null);
    }

    log.debug("retrieving user ", session.user);

    User.findById(session.user, function (err, user) {
        if (err) return callback(err);

        if (!user) {
            return callback(null, null);
        }
        log.debug("user findbyId result: " + user);
        callback(null, user);
    });

}

module.exports = function (server) {
    var io = require('socket.io').listen(server),
        origin = config.get('origin');

    io.set('origins', '' + origin.url + ':' + origin.port);

    io.set('authorization', function (handshake, callback) {
        async.waterfall([
            function (callback) {
                // сделать handshakeData.cookies - объектом с cookie
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:name')];
                var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));

                loadSession(sid, callback);
            },
            function (session, callback) {

                if (!session) {
                    callback(new HttpError(401, "No session"));
                }

                handshake.session = session;
                loadUser(session, callback);
            },
            function (user, callback) {
                if (!user) {
                    callback(new HttpError(403, "Anonymous session may not connect"));
                }

                handshake.user = user;
                callback(null);
            }

        ], function (err) {
            if (!err) {
                return callback(null, true);
            }

            if (err instanceof HttpError) {
                return callback(null, false);
            }

            callback(err);
        });

    });

    io.sockets.on('session:reload', function (sid) {
        var clients = io.sockets.clients();

        clients.forEach(function (client) {
            if (client.handshake.session.id != sid) return;

            loadSession(sid, function (err, session) {
                if (err) {
                    client.emit("error", "server error");
                    client.disconnect();
                    return;
                }

                if (!session) {
                    client.emit("logout");
                    client.disconnect();
                    return;
                }

                client.handshake.session = session;
            });

        });
    });

    io.sockets.on('connection', function (socket) {
        var handshake = getHandShake(socket);
        var user = getUserData(handshake.user);

        function getHandShake(socket) {
            return socket.manager.handshaken[socket.id];
        }

        function getUserData(userModel) {
            return {
                username: userModel.get('username'),
                color: userModel.get('color')
            }
        }

        io.sockets.emit('join', user.username);

        socket.on('message', function (text, callback) {

        });

        socket.on('disconnect', function () {
            socket.broadcast.emit('leave', user.username);
            // client don't remove from clients() after disconnect: https://github.com/Automattic/socket.io/issues/349
        });

    });

    return io;
};