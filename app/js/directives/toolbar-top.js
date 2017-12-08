angular.module('app.directives')
.directive('toolbarTop', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './directives/toolbar-top.html',
        controller: ['$scope', function ($scope) {
            const remote = require('electron').remote;
            
            // scope
            $scope.minimize = minimize;
            $scope.isMaximized = isMaximized;
            $scope.toggleMaximize = toggleMaximize;
            $scope.close = close;
            
            // mimimize
            function minimize() {
                var window = remote.getCurrentWindow();
                window.minimize();
            }
            
            // return if window is maximized
            function isMaximized() {
                var window = remote.getCurrentWindow();
                return window.isMaximized();
            }
            
            // maximize / restore
            function toggleMaximize() {
                var window = remote.getCurrentWindow();
                if (!isMaximized()) {
                    window.maximize();          
                } else {
                    window.unmaximize();
                }
            }
            
            // close
            function close() {
                var window = remote.getCurrentWindow();
                window.close();
            }
        }]
    };
});