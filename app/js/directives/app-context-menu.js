angular.module('app.directives')
.directive('appContextMenu', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, el, attrs) {
            var fn = $parse(attrs.appContextMenu);
            
            el.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, { $event: event });
                });
            });
            
        }
    };
}]);