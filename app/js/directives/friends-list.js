angular.module('app.directives')
    .directive('friendsList', function () {
        return {
            restrict: 'E',
            templateUrl: './directives/friends-list.html',
            controller: [
                '$rootScope',
                '$scope',
                'FriendsService',
                function (
                    $rootScope,
                    $scope,
                    FriendsService
                ) {
                    var defaultFriends = {
                        online: [],
                        offline: [],
                    };

                    // scope
                    $scope.friends = angular.copy(defaultFriends);
                    $scope.close = close;
                    
                    // watch friends service for friend updates
                    $scope.$watch(function() {
                        return FriendsService.getFriends();
                    }, function(newFriends) {
                        updateFriends(newFriends);
                    });

                    // updates the friends list, and sort them to online / offline
                    function updateFriends(friends) {
                        $scope.friends = angular.copy(defaultFriends);
                        for (var i = 0; i < friends.length; i++)  {
                            if (friends[i].online) {
                                $scope.friends.online.push(friends[i]);
                            } else {
                                $scope.friends.offline.push(friends[i]);
                            }
                        }
                    }

                    // close list
                    function close() {
                        $rootScope.$emit('FRIENDS_LIST_CLOSE');
                    }
                }
            ]
        };
    });