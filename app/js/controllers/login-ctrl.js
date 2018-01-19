angular.module('app.controllers')
    .controller('LoginCtrl', ['$scope', 'LoginService', function ($scope, LoginService) {
        $scope.loginWnd = LoginService.loginWnd;
    }]);