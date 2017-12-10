angular.module('app.filters')
.filter('username', function () {
    return function(input) {
        return input.substr(7);
    };
});