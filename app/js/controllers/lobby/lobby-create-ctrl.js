angular.module('app.controllers')
.controller('LobbyCreateCtrl', ['$rootScope', '$scope', '$state', 'Lobby', 'games', function($rootScope, $scope, $state, Lobby, games) {
    // scope
    $scope.loading = false;
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
        $scope.loading = true;
        
        Lobby.createLobby({
            gameId: $scope.selectedGame.id,
            lobbyName: $scope.lobbyName,
            userId: $rootScope.userId,
        }).$promise.then(function (data) {
            // go to lobby
            $state.go('app.games.lobbies.lobby', { lobbyId: data.lobbyId });
        }).catch(function (err) {
            
            // TODO: SHOW ERROR
            
        }).finally(function () {
            $scope.loading = false;
        });
    }
}]);