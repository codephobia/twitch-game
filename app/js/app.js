var app = angular.module('app', [
    'ui.router',
    'ngAnimate',
    'ngMaterial',
    'app.controllers',
    'app.services',
    'app.directives'
])
.config([
    '$stateProvider', '$locationProvider', '$urlRouterProvider', 
    function ($stateProvider, $locationProvider, $urlRouterProvider) {
        $locationProvider.html5Mode(true);
        
        $urlRouterProvider.otherwise('/');
        
        $stateProvider
        .state('app', {
            abstract: true,
            url: '/',
            views: {
                root: {
                    templateUrl: 'game.html'
                }
            },
            resolvePolicy: {
                when:  'EAGER',
                async: 'WAIT'
            }
        })
        .state('app.login', {
            url: '',
            views: {
                game: {
                    templateUrl: 'login.html'
                }
            }
        });
    }
]);

angular.module('app.controllers', []);
angular.module('app.services', []);
angular.module('app.directives', []);
