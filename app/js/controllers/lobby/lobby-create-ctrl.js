angular.module('app.controllers')
.controller('LobbyCreateCtrl', ['$rootScope', '$scope', '$state', 'Lobby', 'games', function($rootScope, $scope, $state, Lobby, games) {
    // scope
    $scope.loading = false;
    $scope.games = games;
    
    $scope.selectedGame = $scope.games[0];
    $scope.lobbyName = "";
    $scope.public = true;
    
    $scope.setGame = setGame;
    $scope.createLobby = createLobby;
    
    // set the game
    function setGame(game) {
        $scope.selectedGame = game;
    }
    
    // create a lobby
    function createLobby() {
        var gameId = $scope.selectedGame.id;
        var lobbyName = $scope.lobbyName;
        var public = $scope.public;
        var userId = $rootScope.userId;
        
        // make sure they entered a lobby name
        if (!lobbyName || !lobbyName.length) {
            return;
        }
        
        // set loading
        $scope.loading = true;
        
        // send create lobby
        Lobby.createLobby({
            gameId: gameId,
            lobbyName: lobbyName,
            public: public,
            userId: userId,
        })
        .$promise
        .then(function (data) {
            // go to created lobby
            $state.go('app.games.lobbies.lobby', { lobbyId: data.lobbyId });
        })
        .catch(function (err) {
            
            // TODO: SHOW ERROR
            
        })
        .finally(function () {
            // unset loading
            $scope.loading = false;
        });
    }
}]);