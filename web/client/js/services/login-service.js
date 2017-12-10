angular.module('app.services')
.service('LoginService', ['$state', '$cookies', 'User', 'LoopBackAuth', function ($state, $cookies, User, LoopBackAuth) {
    
    function login() {
        if (User.isAuthenticated()) {
            return;
        }
        
        document.location = '/login/twitch';
    }
    
    function logout() {
        User.logout(function () {
            // clear user from loopback
            clearUserLoopBack();
            
            // delete auth cookies
            clearUserCookies();
            
            // redirect to login page
            $state.go('app.login');
        });
    }
    
    function clearUserLoopBack() {
        LoopBackAuth.clearUser();
        LoopBackAuth.clearStorage();
    }
    
    function clearUserCookies() {
        $cookies.remove("access_token");
        $cookies.remove("userId");
    }
    
    return {
        login: login,
        logout: logout,
        clearUserLoopBack: clearUserLoopBack,
        clearUserCookies: clearUserCookies
    };
}]);