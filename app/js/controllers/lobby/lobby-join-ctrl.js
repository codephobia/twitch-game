angular.module('app.controllers')
.controller('LobbyJoinCtrl', ['$scope', '$state', function($scope, $state) {
    // scope
    $scope.lobbyCode = "";
    $scope.joinLobby = joinLobby;
    
    function joinLobby(code) {
        $state.go('app.games.lobbies.lobby', { lobbyId: code });
    }
}]);