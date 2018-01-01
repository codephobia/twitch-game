angular.module('app.directives')
.directive('friendsListSection', function () {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, el, attrs) {
            // vars
            var open = false;
            var list = el.find('.friends-wrapper');
            
            updateOpen();
            
            // scope
            scope.toggleOpen = toggleOpen;
            
            // functions
            // handle open class
            function updateOpen() {
                if (open) {
                    el.addClass('open');
                    
                    var height = friendsHeight();
                    list.css('height', height);
                } else {
                    el.removeClass('open');
                    list.css('height', 0);
                }
            }
            
            // toggle openning the list
            function toggleOpen() {
                open = !open;
                
                updateOpen();
            }
            
            // get the height of all friends in the list
            function friendsHeight() {
                var height = 0;
                
                list.find('.friend').each(function () {
                    height += $(this).outerHeight();
                });
                
                return height;
            }
        }
    };
});