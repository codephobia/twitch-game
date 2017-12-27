angular.module('app.services')
.service('LobbyService', ['$rootScope', '$state', '$interval', '$timeout', 'usernameFilter', 'LoopBackAuth', 'SocketService', 'ToastService', 
    function ($rootScope, $state, $interval, $timeout, usernameFilter, LoopBackAuth, SocketService, ToastService) {
        var connected = false;
        var game = null;
        var slots = [];
        var slotsMin = 0;
        var slotsMax = 0;
        var players = [];
        var locked = false;
        var public = false;
        var lobbyName = "";
        var lobbyCode = false;
        var lobbyCodeBlur = false;
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
            connInit();
        }

        // init lobby connection binds
        function connInit() {
            conn.bind('LOBBY_INIT', connInitEvent);
            conn.bind('LOBBY_LOCK', connLockEvent);
            conn.bind('LOBBY_PUBLIC', connPublicEvent);
            conn.bind('LOBBY_JOIN', connJoinEvent);
            conn.bind('LOBBY_PART', connPartEvent);
            conn.bind('LOBBY_PROMOTE', connPromoteEvent);
            conn.bind('LOBBY_KICK', connKickEvent);
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
            conn.send('LOBBY_LOCK');
        }
        
        // toggle if lobby is public
        function togglePublic() {
            conn.send('LOBBY_PUBLIC');
        }
        
        // return if lobby is locked
        function isLocked() {
            return locked;
        }
        
        // return if lobby is public
        function isPublic() {
            return public;
        }
        
        // return lobby code
        function getLobbyCode() {
            return lobbyCode || "";
        }
        
        // return lobby code blur
        function getLobbyCodeBlur() {
            return lobbyCodeBlur;
        }
        
        // toggle lobby code blur
        function toggleLobbyCodeBlur() {
            lobbyCodeBlur = !lobbyCodeBlur;
        }
        
        function part() {
            conn.send('LOBBY_PART');
        }
        
        // return if we can start the game
        function canStart() {
            return players.length >= slotsMin;
        }
        
        // connection receieved init event
        function connInitEvent(data) {
            // sort players array based on join time
            var p = data.players.sort(function (a, b) {
                if (a.joinTime < b.joinTime) {
                    return -1;
                }
                if (a.joinTime > b.joinTime) {
                    return 1;
                }
                return 0;
            });

            $timeout(function () {
                connected = true;
                game = data.game;
                slots = new Array(game.slotsMax);
                slotsMin = game.slotsMin;
                slotsMax = game.slotsMax;
                players = p;
                lobbyName = data.lobbyName;
                lobbyCode = data.lobbyCode;
                locked = data.locked;
                public = data.public;
            });
        }
        
        // connection received lock event
        function connLockEvent(data) {
            console.log('[INFO] event: lobby lock: ', data);

            $timeout(function () {
                locked = data.locked;
            });

            if (data.locked) {
                ToastService.show('The lobby is now locked', 'success');
            } else {
                ToastService.show('The lobby is now unlocked', 'success');
            }
        }
        
        // connection received lock event
        function connPublicEvent(data) {
            console.log('[INFO] event: lobby public: ', data);

            $timeout(function () {
                public = data.public;
            });

            if (data.public) {
                ToastService.show('The lobby is now public', 'success');
            } else {
                ToastService.show('The lobby is now private', 'success');
            }
        }
        
        // connection received join event
        function connJoinEvent(data) {
            console.log('[INFO] event: lobby join: ', data);
            $timeout(function () {
                players.push(data.player);
            });
        }
        
        // connection receieved part event
        function connPartEvent(data) {
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
        }
        
        // connection received promote event
        function connPromoteEvent(data) {
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
        }
        
        // connection received kick event
        function connKickEvent(data) {
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
            getLobbyCode: getLobbyCode,
            getLobbyCodeBlur: getLobbyCodeBlur,
            toggleLobbyCodeBlur: toggleLobbyCodeBlur,
            canStart: canStart,
            
            isLocked: isLocked,
            toggleLocked: toggleLocked,
            
            isPublic: isPublic,
            togglePublic: togglePublic,
            
            promoteToLeader: promoteToLeader,
            kickPlayer: kickPlayer,
            part: part,
        };
    }
]);