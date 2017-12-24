angular.module('app.controllers')
.controller('AppCtrl', ['$rootScope', '$timeout', '$cookies', function ($rootScope, $timeout, $cookies) {
    const ipcRenderer = require('electron').ipcRenderer;

    function getCookie(name) {
        ipcRenderer.send('get-cookie', name);
    }
    
    getCookie('index');
    
    ipcRenderer.on('cookie', function (e, data) {
        var index = (data && data.value) ? parseInt(data.value) : 0;
        $rootScope.userId = generateUserId(index);
        
        index = index + 1;
        
        ipcRenderer.send('set-cookie', {
            name: 'index',
            value: index.toString()
        });
    });
    
    function generateUserId(index) {
        var users = [
            "5a2c927e7b0e5d4610634d8c", // codephobia
            "5a3f2fe947d63a337cbb2a6b", // fred
            "5a3f300547d63a337cbb2a6d", // steve
            "5a3f300d47d63a337cbb2a6f", // harry
            "5a3f301547d63a337cbb2a71", // barry
            "5a3f301e47d63a337cbb2a73", // bruce
        ];

        return users[index % users.length];
    }
}]);