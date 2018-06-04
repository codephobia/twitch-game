angular.module('app.controllers')
    .controller('AppCtrl', [
        '$rootScope',
        '$scope',
        'FriendsService',
        function (
            $rootScope,
            $scope,
            FriendsService
        ) {
            const ipcRenderer = require('electron').ipcRenderer;

            // handle login, and init the friends server connection
            $rootScope.$on('APP_LOGIN', function () {
                FriendsService.init();
            });

            // emit app close on browser window unload
            window.onbeforeunload = function () {
                $rootScope.$emit('APP_CLOSE');
            };

            // friends list
            var friendsOpen = false;
            $scope.friendsOpen = function () {
                return friendsOpen;
            };
            
            // handle friends list toggle event
            $rootScope.$on('FRIENDS_LIST_TOGGLE', function () {
                friendsOpen = !friendsOpen;
            });
            
            // handle friends list close event
            $rootScope.$on('FRIENDS_LIST_CLOSE', function () {
                friendsOpen = false;
            });
            
            $rootScope.$on('APP_LOGOUT', function () {
                friendsOpen = false;
            });
            
            // TODO: REMOVE COOKIE USER HACK
            function getCookie(name) {
                ipcRenderer.send('get-cookie', name);
            }
            
            getCookie('index');
            
            ipcRenderer.on('cookie', function (e, data) {
                var index = (data && data.value) ? parseInt(data.value) : 0;
                $rootScope.userId = generateUserId(index);
                
                index = index + 1;
                
                ipcRenderer.send('set-cookie', {
                    name: 'index',
                    value: index.toString()
                });
            });
            
            function generateUserId(index) {
                var users = [
                    '5a2c927e7b0e5d4610634d8c', // codephobia
                    '5a3f2fe947d63a337cbb2a6b', // fred
                    '5a3f300547d63a337cbb2a6d', // steve
                    '5a3f300d47d63a337cbb2a6f', // harry
                    '5a3f301547d63a337cbb2a71', // barry
                    '5a3f301e47d63a337cbb2a73', // bruce
                ];

                return users[index % users.length];
            }
        }
    ]);