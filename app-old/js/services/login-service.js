angular.module('app.services')
    .service('LoginService', [
        '$rootScope',
        '$state',
        '$cookieStore',
        'User',
        'Avatar',
        'LoopBackAuth',
        'UserService',
        function (
            $rootScope,
            $state,
            $cookies,
            User,
            Avatar,
            LoopBackAuth,
            UserService
        ) {
            const ipcRenderer = require('electron').ipcRenderer;
            
            // open login window
            function loginWnd() {
                ipcRenderer.send('oauth-login');
            }

            // login
            function login(event, authInfo) {
                if (!authInfo || !authInfo.accessToken || !authInfo.userId) {
                    // TODO: handle login error
                    return;
                }
                
                LoopBackAuth.setUser(authInfo.accessToken, authInfo.userId);
                LoopBackAuth.save();
                
                async.waterfall([
                    function (waterfallCb) {
                        User.getCurrent()
                            .$promise
                            .then(function (user) {
                                return waterfallCb(null, user.id);
                            })
                            .catch(function (err) {
                                return waterfallCb(err);
                            });
                    },
                    function (userId, waterfallCb) {
                        Avatar.findOne({
                            filter: {
                                where: {
                                    userId: userId
                                },
                                fields: ['shape']
                            }
                        })
                            .$promise
                            .then(function (avatar) {
                                return waterfallCb(null, avatar);
                            })
                            .catch(function (err) {
                                return waterfallCb(err);
                            });
                    }
                ], function (err, avatar) {
                    if (err) {
                        clearUserLoopBack();
                        return;
                    }
                    
                    // save avatar
                    UserService.setAvatar(avatar);

                    // emit login event
                    $rootScope.$emit('APP_LOGIN');
                    console.log('login');

                    // go to games home
                    $state.go('app.games.home');
                });
            }
            
            // clear user from loopback auth
            function clearUserLoopBack() {
                LoopBackAuth.clearUser();
                LoopBackAuth.clearStorage();
            }

            // clear user cookies
            function clearUserCookies() {
                $cookies.remove('access_token');
                $cookies.remove('userId');
            }
            
            // logout user
            function logout() {
                $rootScope.$emit('APP_LOGOUT');
                
                User.logout(function () {
                    $state.go('app.login');
                });
            }
            
            // catch oauth login reply
            ipcRenderer.on('oauth-login-reply', login);
            
            // return
            return {
                loginWnd: loginWnd,
                logout: logout,
                clearUserLoopBack: clearUserLoopBack,
                clearUserCookies: clearUserCookies
            };
        }
    ]);