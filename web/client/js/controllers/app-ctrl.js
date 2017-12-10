angular.module('app.controllers')
.controller('AppCtrl', ['$scope', 'LoginService', function ($scope, LoginService) {
    // scope
    $scope.login = LoginService.login;
    $scope.logout = LoginService.logout;
}]);