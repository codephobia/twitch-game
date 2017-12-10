var app = angular.module('app', [
    'ui.router',
    'ngAnimate',
    'ngMaterial',
    'ngResource',
    'ngCookies',
    'lbServices',
    'app.controllers',
    'app.services',
    'app.directives',
    'app.filters'
])
.run([
    '$cookies', 'LoopBackAuth', 'LoginService', 
    function ($cookies, LoopBackAuth, LoginService) {
        // try to get user from cookies if it exists
        try {
            var accessToken = $cookies.get("access_token");
            var userId = $cookies.get("userId");
            
            if (accessToken && userId) {
                LoopBackAuth.setUser(accessToken, userId);
                LoopBackAuth.save();
            }
        } catch(err) {
            LoginService.clearUserCookies();
        }
    }
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
            },
            resolve: {
                currentUser: ['$q', '$cookies', 'User', 'LoopBackAuth', 'LoginService', 
                    function ($q, $cookies, User, LoopBackAuth) {
                        var d = $q.defer();
                        
                        if (User.isAuthenticated() && !LoopBackAuth.currentUserData) {
                            User.getCurrent()
                            .$promise
                            .then(function (user) {
                                d.resolve(user);
                            })
                            .catch(function () {
                                // clear invalid user data
                                LoginService.clearUserLoopBack();
                                LoginService.clearUserCookies();
                                d.resolve(false);
                            });
                        } else {
                            d.resolve(LoopBackAuth.currentUserData);
                        }

                        return d.promise;
                    }
                ]
            }
        })
        .state('app.login', {
            url: '',
            views: {
                game: {
                    templateUrl: 'login.html',
                    controller: 'LoginCtrl'
                }
            },
            onEnter: ['$state', 'User', function ($state, User) {
                if (User.isAuthenticated()) {
                    $state.go('app.games.home');
                }
            }]
        })
        .state('app.games', {
            abstract: true,
            url: 'games',
            views: {
                game: {
                    templateUrl: 'games.html',
                    controller: 'GamesCtrl'
                }
            },
            onEnter: ['$state', 'User', function ($state, User) {
                if (!User.isAuthenticated()) {
                    $state.go('app.login');
                }
            }]
        })
        .state('app.games.home', {
            url: '',
            views: {
                games: {
                    templateUrl: 'games.home.html'
                }
            }
        });
    }
]);

angular.module('app.controllers', []);
angular.module('app.services', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
