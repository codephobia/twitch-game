angular.module('app.directives')
    .directive('friendsList', function () {
        return {
            restrict: 'E',
            templateUrl: './directives/friends-list.html',
            controller: ['$rootScope', '$scope', function ($rootScope, $scope) {
                // scope
                $scope.close = close;
                
                // close list
                function close() {
                    $rootScope.$emit('FRIENDS_LIST_CLOSE');
                }
            }]
        };
    });