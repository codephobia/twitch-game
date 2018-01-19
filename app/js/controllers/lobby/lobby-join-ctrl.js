angular.module('app.controllers')
    .controller('LobbyJoinCtrl', ['$scope', '$state', 'Lobby', function($scope, $state, Lobby) {
        // scope
        $scope.loading = false;
        $scope.lobbyCode = '';
        $scope.joinLobby = joinLobby;
        
        function joinLobby(code) {
            $scope.loading = true;
            
            async.waterfall([
                function (waterfallCb) {
                    Lobby.findOne({
                        filter: {
                            where: {
                                code: code.toUpperCase()
                            },
                            fields: ['id']
                        }
                    })
                        .$promise
                        .then(function (data) {
                            return waterfallCb(null, data.id);
                        })
                        .catch(function (err) {
                            return waterfallCb(err);
                        });
                }
            ], function (err, lobbyId) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error('[ERROR] join lobby: ', err);
                    $scope.loading = false;
                    return;
                }
                
                // go to lobby
                $state.go('app.games.lobbies.lobby', { lobbyId: lobbyId });
            });
        }
    }]);