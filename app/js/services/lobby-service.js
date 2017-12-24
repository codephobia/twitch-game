angular.module('app.services')
.service('LobbyService', ['$rootScope', '$state', '$interval', '$timeout', 'usernameFilter', 'LoopBackAuth', 'SocketService', 'ToastService', 
    function ($rootScope, $state, $interval, $timeout, usernameFilter, LoopBackAuth, SocketService, ToastService) {
        var connected = false;
        var game = null;
        var slots = [];
        var players = [];
        var locked = false;
        var lobbyName = "";
        var lobbyCode = false;
        var conn;

        var userId = $rootScope.userId;
        
        // init lobby
        function init(lobbyId) {
            var currentUserId = userId;//LoopBackAuth.currentUserData.id;
            var url = 'ws://localhost:8080/lobby/join?lobby_id=' + lobbyId + '&user_id=' + currentUserId;
            
            conn = SocketService.new(
                url,
                function () {
                    console.log('connected');
                },
                function () {
                    console.log('disconnected');
                    connected = false;
                    $state.go('app.games.home');
                }
            );
            
            // init the connection bindings
            connectionInit();
        }

        // init lobby connection binds
        function connectionInit() {
            conn.bind('LOBBY_INIT', function (data) {
                $timeout(function () {
                    connected = true;
                    game = data.game;
                    slots = new Array(game.slots);
                    players = data.players;
                    lobbyName = data.lobbyName;
                    lobbyCode = data.lobbyCode;
                    locked = data.locked;
                });
            });
            
            conn.bind('LOBBY_LOCK', function (data) {
                console.log('[INFO] event: lobby lock: ', data);
                
                $timeout(function () {
                    locked = data.locked;
                });

                if (data.locked) {
                    ToastService.show('The lobby is now locked', 'success');
                } else {
                    ToastService.show('The lobby is now unlocked', 'success');
                }
            });
            
            conn.bind('LOBBY_JOIN', function (data) {
                console.log('[INFO] event: lobby join: ', data);
                $timeout(function () {
                    players.push(data.player);
                });
            });
            
            conn.bind('LOBBY_PART', function (data) {
                console.log('[INFO] event: lobby part: ', data);
                for (var i = players.length - 1; i >= 0; i--) {
                    if (players[i].userId === data.userId) {
                        
                        ToastService.show(usernameFilter(players[i].username) + ' has left the lobby', 'success');
                        
                        $timeout(function () {
                            players.splice(i, 1);
                        });
                        break;
                    }
                }
            });
            
            conn.bind('LOBBY_PROMOTE', function (data) {
                console.log('[INFO] event: lobby promote: ', data);
                var newLeaderId = data.userId;
                
                $timeout(function () {
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].userId === newLeaderId) {
                            players[i].isLeader = true;
                            
                            // show toast
                            ToastService.show(usernameFilter(players[i].username) + ' was promoted to leader', 'success');
                        } else {
                            players[i].isLeader = false;
                        }
                    }
                });
            });
            
            conn.bind('LOBBY_KICK', function (data) {
                if (data.userId === userId) {
                    console.log('[INFO] kicked from lobby');
                    
                    // show kicked toast
                    ToastService.show('You were kicked from the lobby', 'error');
                } else {
                    for (var i = players.length - 1; i >= 0; i--) {
                        if (players[i].userId === data.userId) {
                            $timeout(function () {
                                ToastService.show(usernameFilter(players[i].username) + ' was kicked from the lobby', 'success');
                                players.splice(i, 1);
                            });
                            break;
                        }
                    }
                }
            });
        }
        
        // return if we're connected to the lobby
        function isConnected() {
            return connected;
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
            var currentPlayerId = userId;//LoopBackAuth.currentUserData.id;
            return getPlayerById(currentPlayerId);
        }
        
        // get lobby player
        function getPlayer(index) {
            return players[index];
        }
        
        // get the player username by slot index
        function getUsernameByIndex(index) {
            if (!players[index]) {
                return '';
            }
            
            return players[index].username;
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
            var currentPlayerId = userId;//LoopBackAuth.currentUserData.id;
            var currentPlayer = getPlayerById(currentPlayerId);
            
            // make sure we found a player
            if (!currentPlayer) {
                return false;
            }
            
            return currentPlayer.isLeader;
        }

        function promoteToLeader(index) {
            // make sure player is leader
            if (!playerIsLeader()) { return; }
            
            // get player by index
            var player = getPlayer(index);
            
            // send promote event
            conn.send('LOBBY_PROMOTE', {
                userId: player.userId
            });
        }
        
        // kick player from lobby
        function kickPlayer(userId) {
            conn.send('LOBBY_KICK', {
                userId: userId
            });
        }
        
        // toggle if lobby is locked
        function toggleLocked() {
            conn.send('LOBBY_LOCK', {
                locked: !locked
            });
        }
        
        // return if lobby is locked
        function isLocked() {
            return locked;
        }
        
        // return lobby code
        function getLobbyCode() {
            return lobbyCode || "";
        }
        
        function part() {
            conn.send('LOBBY_PART', {
                userId: userId//LoopBackAuth.currentUserData.id
            });
        }
        
        // return available methods
        return {
            init: init,
            isConnected: isConnected,
            getGame: getGame,
            getSlots: getSlots,
            getCurrentPlayer: getCurrentPlayer,
            getPlayer: getPlayer,
            getUsernameByIndex: getUsernameByIndex,
            playerIsLeader: playerIsLeader,
            promoteToLeader: promoteToLeader,
            kickPlayer: kickPlayer,
            toggleLocked: toggleLocked,
            isLocked: isLocked,
            getLobbyCode: getLobbyCode,
            
            part: part,
        };
    }
]);