angular.module('app.controllers')
.controller('LobbyCtrl', ['$scope', '$stateParams', 'LobbyService', function ($scope, $stateParams, LobbyService) {
    // vars
    var lobbyId = $stateParams.lobbyId;
    var slots = new Array(8);
    var players = [
        {
            userId: "5a2c927e7b0e5d4610634d8c",
            isLeader: true,
            username: 'codephobia'
        },
        {
            userId: "5a2c927e7b0e5d4610634d8d",
            isLeader: false,
            username: 'daydreamdev'
        },
        {
            userId: "5a2c927e7b0e5d4610634d8e",
            isLeader: false,
            username: 'riddari_'
        },
        {
            userId: "5a2c927e7b0e5d4610634d8f",
            isLeader: false,
            username: 'nightbot'
        }
    ];
    
    $scope.lobby = LobbyService;
    $scope.lobby.init(lobbyId, slots, players);
    
}]);