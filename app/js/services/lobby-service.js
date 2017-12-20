angular.module('app.services')
.service('LobbyService', ['$interval', '$timeout', 'LoopBackAuth', 'SocketService', 
    function ($interval, $timeout, LoopBackAuth, SocketService) {
        var game = null;
        var slots = [];
        var players = [];
        var locked = false;
        var conn;

        // init lobby
        function init(lobbyId) {
            var currentUserId = LoopBackAuth.currentUserData.id;
            var url = 'ws://localhost:8080/lobby/join?lobby_id=' + lobbyId + '&user_id=' + currentUserId;
            
            conn = SocketService.new(
                url,
                function () {
                    console.log('connected');
                },
                function () {
                    console.log('disconnected');
                }
            );
            
            // init the connection bindings
            connectionInit();
        }

        // init lobby connection binds
        function connectionInit() {
            conn.bind('LOBBY_INIT', function (data) {
                $timeout(function () {
                    game = data.game;
                    slots = new Array(game.slots);
                    players = data.players;
                    locked = data.locked;
                });
            });
        }
        
        // get lobby game info
        function getGame() {
            return game;
        }
        
        // get lobby game info
        function getSlots() {
            return slots;
        }
        
        function getCurrentPlayer() {
            var currentPlayerId = LoopBackAuth.currentUserData.id;
            return getPlayerById(currentPlayerId);
        }
        
        // get lobby player
        function getPlayer(index) {
            return players[index];
        }
        
        function getPlayerById(userId) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].userId === userId) {
                    return players[i];
                }
            }
            
            return false;
        }
        
        // check if player is leader
        function playerIsLeader() {
            var currentPlayerId = LoopBackAuth.currentUserData.id;
            var currentPlayer = getPlayerById(currentPlayerId);
            
            // make sure we found a player
            if (!currentPlayer) {
                return false;
            }
            
            return currentPlayer.isLeader;
        }

        function promoteToLeader(userId) {
            // make sure player is leader
            if (!playerIsLeader()) { return; }
            
            // unset current leader
            for (var i = 0; i < players.length; i++) {
                if (players[i].isLeader) {
                    players[i].isLeader = false;
                    break;
                }
            }
            
            // set new leader
            newLeader = getPlayerById(userId);
            newLeader.isLeader = true;
        }
        
        // kick player from lobby
        function kickPlayer(userId) {
            var player = getPlayerById(userId);
            var index = players.indexOf(player);
            players.splice(index, 1);
        }
        
        // toggle if lobby is locked
        function toggleLocked() {
            locked = !locked;
        }
        
        // return if lobby is locked
        function isLocked() {
            return locked;
        }
        
        // return available methods
        return {
            init: init,
            getGame: getGame,
            getSlots: getSlots,
            getCurrentPlayer: getCurrentPlayer,
            getPlayer: getPlayer,
            playerIsLeader: playerIsLeader,
            promoteToLeader: promoteToLeader,
            kickPlayer: kickPlayer,
            toggleLocked: toggleLocked,
            isLocked: isLocked,
        };
    }
]);