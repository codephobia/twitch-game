angular.module('app.controllers')
    .controller('LobbyFindCtrl', ['$scope', '$state', 'LoopBackAuth', 'Lobby', 'dataGames', 'queryLobbies', 'dataLobbies', function ($scope, $state, LoopBackAuth, Lobby, dataGames, queryLobbies, dataLobbies) {
        // vars
        var lobbies = dataLobbies;
        var games = dataGames;
        
        // scope
        $scope.games = [{ id: 'all', name: 'All Games' }].concat(games);
        $scope.lobbies = lobbies;
        
        $scope.joinLobby = joinLobby;
        $scope.getLobbies = getLobbies;
        
        $scope.filters = {
            game: 'all',
            search: '',
        };
        
        // get lobbies
        function getLobbies() {
            var where = queryLobbies.filter.where;
            
            // check for game filtering
            if ($scope.filters.game !== 'all') {
                where['gameId'] = $scope.filters.game;
            }
            
            // check for search
            if ($scope.filters.search && $scope.filters.search.length) {
                var pattern = '/.*' + $scope.filters.search + '.*/i';
                where['name'] = { regexp: pattern };
            }
            
            Lobby.find({
                filter: {
                    where: where,
                    include: queryLobbies.filter.include,
                }
            })
                .$promise
                .then(function (data) {
                    $scope.lobbies = data;
                });
        }
        
        // join lobby
        function joinLobby(lobby) {
            // don't allow trying to join locked lobby
            if (lobby.locked) {
                return;
            }
            
            // join lobby
            $state.go('app.games.lobbies.lobby', { lobbyId: lobby.id });
        }
    }]);