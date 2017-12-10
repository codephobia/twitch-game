angular.module('app.directives')
.directive('toolbarBottom', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './directives/toolbar-bottom.html',
        controller: ['$scope', '$mdDialog', 'User', 'LoginService', 'LoopBackAuth', 
            function ($scope, $mdDialog, User, LoginService, LoopBackAuth) {
                // scope
                $scope.isLoggedIn = isLoggedIn;
                $scope.logout = LoginService.logout;
                $scope.openMenu = openMenu;
                $scope.username = function () {
                    return (LoopBackAuth.currentUserData) ? LoopBackAuth.currentUserData.username : '';
                };
                
                // return is user is logged in
                function isLoggedIn() {
                    return User.isAuthenticated();
                }

                // open menu
                function openMenu($mdMenu, $event) {
                    $mdMenu.open($event);
                }
            }
        ]
    };
});