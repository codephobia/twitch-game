angular.module('app.controllers')
.controller('LobbyCreateCtrl', ['$scope', '$state', 'Lobby', 'games', function($scope, $state, Lobby, games) {
    // scope
    $scope.games = games;
    $scope.selectedGame = $scope.games[0];
    $scope.setGame = setGame;
    $scope.lobbyName = "";
    $scope.createLobby = createLobby;
    
    // set the game
    function setGame(game) {
        $scope.selectedGame = game;
    }
    
    function createLobby() {
        Lobby.createLobby({
            gameId: $scope.selectedGame.id,
            name: $scope.lobbyName
        }).$promise.then(function (data) {
            // go to lobby
            $state.go('app.games.lobbies.lobby', { lobbyId: data.lobbyId });
        }).catch(function (err) {
            
            // TODO: SHOW ERROR
            
        }).finally(function () {
            
        });
    }
}]);