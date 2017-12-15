angular.module('app.controllers')
.controller('LobbyCreateCtrl', ['$scope', function($scope) {
    // scope
    $scope.games = [1,2,3,4];
    $scope.selectedGame = $scope.games[0];
    $scope.setGame = setGame;
    
    // set the game
    function setGame(game) {
        $scope.selectedGame = game;
    }
}]);