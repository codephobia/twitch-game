angular.module('app.filters')
.filter('username', function () {
    return function(input) {
        if (!input && !input.length) {
            return '';
        }
        return input.substr(7);
    };
});