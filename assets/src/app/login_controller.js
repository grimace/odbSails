angular.module('kombi.login_controller', []);
angular.module('kombi.login_controller')
.controller("LoginController", function ($rootScope, $scope, $http, $location) {
    
    console.log("LoginController init...");
    
    $scope.loginUser = function() {
       var url = '/auth/login';
       console.log('loging in ..., url : '+url);
       $http.get(url)
       .then(function(res){
          $rootScope.currentUser = res.data.user;
          console.log('login found : '+res.data.user);
        });
    }

    $scope.getUser = function() {
       var url = '/auth/get_user';
       console.log('get_user in ..., url : '+url);
       $http.get(url)
       .then(function(res){
           
          console.log('login found : '+JSON.stringify(res.data));
          $rootScope.currentUser = res.data.user;
          $location.path('/home');

        });
    }

})
