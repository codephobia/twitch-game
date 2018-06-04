angular.module('app.services')
    .service('FriendsService', [
        '$rootScope',
        'LoopBackAuth',
        'SocketService',
        function(
            $rootScope,
            LoopBackAuth,
            SocketService
        ) {
            console.log('init');
            
            var connected = false;
            var conn = null;
            var friends = [];

            // init friends
            function init() {
                var currentUserId = LoopBackAuth.currentUserData.id;
                var url = 'ws://localhost:8081/connect?user_id=' + currentUserId;
                
                conn = SocketService.new(
                    url,
                    function () {
                        // eslint-disable-next-line no-console
                        console.info('[INFO] friends connected');
                        connected = true;
                    },
                    function () {
                        // eslint-disable-next-line no-console
                        console.info('[INFO] friends disconnected');
                        connected = false;
                    }
                );
                
                // init the connection bindings
                connInit();
            }

            // init friends connection binds
            function connInit() {
                conn.bind('SERVER_CONNECT', connServerConnectEvent);
            }

            // return if we're connected to the friends server
            function isConnected() {
                return connected;
            }

            // disconnect from the friends server
            function part() {
                // conn.send('SERVER_PART');
                conn.close();
            }
            
            // server connect event
            function connServerConnectEvent(data) {
                friends = data.friends;
            }

            // returns the user friends array
            function getFriends() {
                return friends;
            }
            
            // handle logout, and send part event if we're connected
            $rootScope.$on('APP_LOGOUT', function () {
                if (connected) {
                    part();
                }
            });
            
            // handle app close, and send part event if we're connected
            $rootScope.$on('APP_CLOSE', function () {
                if (connected) {
                    part();
                }
            });

            return {
                init: init,
                isConnected: isConnected,
                part: part,

                getFriends: getFriends,
            };
        }
    ]);