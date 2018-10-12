angular.module('app.directives')
    .directive('mousepointMenu', [function () {
        return {
            restrict: 'A',
            require: 'mdMenu',
            link: function ($scope, $element, $attrs, mdMenuCtrl) {
                var MousePointMenuCtrl = mdMenuCtrl;
                
                $scope.$mdOpenMousepointMenu = function ($event) {
                    MousePointMenuCtrl.offsets = function () {
                        var parentPos = $($event.target).closest('.md-menu').position();
                        
                        var offsets = {
                            left: $event.clientX - parentPos.left,
                            top: $event.clientY - parentPos.top
                        };
                        
                        return offsets;
                    };
                    MousePointMenuCtrl.open($event);
                };
            }
        };
    }]);