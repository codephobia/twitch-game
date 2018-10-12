angular.module('app.directives')
    .directive('appScrollbar', ['$interval', function ($interval) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, el) {
                var options = {
                    wheelSpeed: 2,
                    wheelPropagation: true,
                    minScrollbarLength: 20
                };
                var scrollbar = new PerfectScrollbar(el[0], options);
                
                $interval(function () {
                    scrollbar.update();
                }, 1000);
            }
        };
    }]);