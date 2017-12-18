angular.module('app.controllers')
.controller('LobbyCtrl', ['$scope', function ($scope) {
    // vars
    var slots = new Array(8);
    var players = [
        {
            isLeader: true,
            username: 'codephobia'
        },
        {
            isLeader: false,
            username: 'daydreamdev'
        },
        {
            isLeader: false,
            username: 'ridarri'
        },
        {
            isLeader: false,
            username: 'nightbot'
        }
    ];
    
    // scope
    $scope.slots = slots;
    $scope.players = players;
    $scope.locked = false;
    
}]);