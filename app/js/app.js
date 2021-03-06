angular.module('app', [
    'ui.router',
    'ngAnimate',
    'ngMaterial',
    'ngResource',
    'ngCookies',
    'ls.LiveSet',
    'ls.ChangeStream',
    'lbServices',
    'app.controllers',
    'app.services',
    'app.directives',
    'app.filters'
]).run([
    '$cookies', 'LoopBackAuth', 'LoginService', 
    function ($cookies, LoopBackAuth, LoginService) {
        // try to get user from cookies if it exists
        try {
            var accessToken = $cookies.get('access_token');
            var userId = $cookies.get('userId');
            
            if (accessToken && userId) {
                LoopBackAuth.setUser(accessToken, userId);
                LoopBackAuth.save();
            }
        } catch(err) {
            LoginService.clearUserCookies();
        }
    }
]).config([
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
                        function ($q, $cookies, User, LoopBackAuth, LoginService) {
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
                        templateUrl: 'games.html'
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
            })
            .state('app.games.lobbies', {
                abstract: true,
                url: '/lobby',
                views: {
                    games: {
                        templateUrl: 'lobby/lobbies.index.html'
                    }
                }
            })
            .state('app.games.lobbies.create', {
                url: '',
                views: {
                    lobby: {
                        templateUrl: 'lobby/lobbies.create.html',
                        controller: 'LobbyCreateCtrl'
                    }
                },
                resolve: {
                    games: ['Game', function (Game) {
                        return Game.find({}).$promise;
                    }]
                }
            })
            .state('app.games.lobbies.join', {
                url: '/join',
                views: {
                    lobby: {
                        templateUrl: 'lobby/lobbies.join.html',
                        controller: 'LobbyJoinCtrl'
                    }
                }
            })
            .state('app.games.lobbies.find', {
                url: '/find',
                views: {
                    lobby: {
                        templateUrl: 'lobby/lobbies.find.html',
                        controller: 'LobbyFindCtrl'
                    }
                },
                resolve: {
                    dataGames: ['Game', function (Game) {
                        return Game.find({
                            filter: {
                                where: {},
                                fields: ['id', 'name']
                            }
                        }).$promise;
                    }],
                    queryLobbies: [function () {
                        return {
                            filter: {
                                where: {
                                    public: true,
                                },
                                fields: ['id', 'name', 'locked', 'players', 'gameId'],
                                include: [
                                    {
                                        relation: 'game',
                                        scope: {
                                            fields: ['name', 'slotsMax']
                                        }
                                    }
                                ]
                            }
                        };
                    }],
                    dataLobbies: ['Lobby', 'queryLobbies', function (Lobby, queryLobbies) {
                        return Lobby.find(queryLobbies).$promise;
                    }]
                }
            })
            .state('app.games.lobbies.lobby', {
                url: '/:lobbyId',
                views: {
                    lobby: {
                        templateUrl: 'lobby/lobbies.lobby.html',
                        controller: 'LobbyCtrl'
                    }
                }
            })
            .state('app.games.test', {
                url: '/test',
                views: {
                    games: {
                        templateUrl: 'games/test.html'
                    }
                }
            });
    }
]);

angular.module('app.controllers', []);
angular.module('app.services', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
