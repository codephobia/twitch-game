angular.module('app.services')
.service('LobbyService', ['$interval', 'LoopBackAuth', 
    function ($interval, LoopBackAuth) {
        var slots = [];
        var players = [];
        var locked = false;
        var socket;

        // init lobby
        function init(lobbyId, s, p) {
            var currentUserId = LoopBackAuth.currentUserData.id;
            
            socket = new WebSocket('ws://localhost:8080/lobby/join?lobby_id=' + lobbyId + '&user_id=' + currentUserId);
            socketInit();

            slots = s;
            players = p;
            
        }

        function socketInit() {
            socket.onmessage = function (message) {
                console.log('socket message: ', message.data);
            };
            socket.onclose = function (event) {
                console.log('socket closed');
            };
        }
        
        // get lobby slots
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