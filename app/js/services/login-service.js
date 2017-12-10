angular.module('app.services')
.service('LoginService', ['$state', 'User', 'LoopBackAuth', function ($state, User, LoopBackAuth) {
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
        
        User.getCurrent()
        .$promise
        .then(function (user) {
            // TODO: handle user data
            $state.go('app.games.home');
        })
        .catch(function () {
            // clear invalid user data
            clearUserLoopBack();
        });
    }

    // clear user from loopback auth
    function clearUserLoopBack() {
        LoopBackAuth.clearUser();
        LoopBackAuth.clearStorage();
    }

    // clear user cookies
    function clearUserCookies() {
        $cookies.remove("access_token");
        $cookies.remove("userId");
    }
    
    // logout user
    function logout() {
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
}]);