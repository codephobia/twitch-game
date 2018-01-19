angular.module('app.services')
    .service('UserService', function () {
        var avatar = {};
        
        // set avatar
        function setAvatar(data) {
            avatar = data;
        }
        
        // get avatar
        function getAvatar() {
            return avatar;
        }
        
        return {
            setAvatar: setAvatar,
            getAvatar: getAvatar
        };
    });