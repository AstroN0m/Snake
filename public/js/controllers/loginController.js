Game.controller('LoginController', function ($scope, $http) {
    $scope.userData = {};
    $scope.colors = [
        '#55ff00','#ff0055','#0055ff','#5500ff','#ff5500',
        '#00ff80','#0080ff','#8000ff','#80ff00','#ff0080',
        '#ff8000','#00ff3f','#003fff','#3f00ff','#3fff00',
        '#ff3f00','#ff003f','#ea4a5a','#00ffbc','#ff004f','#8e1720'];
    $scope.userData.color = $scope.colors[0];

    function submitForm(url) {
        return function () {
            $http({
                method: 'POST',
                url: url,
                data: $scope.userData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                }
            })
                .success(function (data) {
                    $scope.message = 'Authorization is completed';
                    window.location.href = "/game";
                }).
                error(function (data) {
                    console.log(data);
                    $scope.message = data;
                });
        }
    }

    $scope.login = submitForm('login');
    $scope.signup = submitForm('signup');

    $scope.logout = function () {
        $http({
            method: 'POST',
            url: 'logout'
        })
        .success(function () {
            window.location.href = "/";
        }).
        error(function () {

        });
    }
});