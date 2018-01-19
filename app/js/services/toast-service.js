angular.module('app.services')
    //.config(['$mdToastProvider', function ($mdToastProvider) {
    // $mdToastProvider.addPreset('default', {});
    //}])
    .service('ToastService', ['$mdToast', function ($mdToast) {
        function show(message, theme) {
            $mdToast.show({
                templateUrl: 'toasts/default.html',
                controller: ['$scope', function($scope) {
                    $scope.message = message;
                    $scope.theme = theme;
                }],
            });
        }
        
        return {
            show: show,
        };
    }]);