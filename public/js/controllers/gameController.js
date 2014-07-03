Game.controller('GameController', ['$scope', 'socket', function ($scope, socket) {

    $scope.sendMessage = function() {

		return false;
	}

	socket.on('message', function (username, color, message) {

	})
	socket.on('leave', function (username, users) {

	})
	socket.on('join', function (username, users) {

	})
	socket.on('connect', function () {

	})
	socket.on('disconnect', function () {

	})

	socket.on('logout', function () {

	})
	socket.on('error', function (reason) {

	});
}]);