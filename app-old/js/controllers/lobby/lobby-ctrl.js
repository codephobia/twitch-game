angular.module('app.controllers')
    .controller('LobbyCtrl', ['$scope', '$stateParams', 'LobbyService', function ($scope, $stateParams, LobbyService) {
        // vars
        var lobbyId = $stateParams.lobbyId;

        // scope
        $scope.lobby = LobbyService;
        $scope.lobby.init(lobbyId);
    }]);