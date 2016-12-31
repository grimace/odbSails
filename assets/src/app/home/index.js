angular.module( 'kombi.home', [
])

.config(function config( $stateProvider ) {
	$stateProvider.state( 'home', {
		url: '/home',
		views: {
			"main": {
				controller: 'HomeCtrl',
				templateUrl: 'home/index.tpl.html'
			}
		}
	});
//	$stateProvider.state( 'login', {
//		url: '/login',
//		views: {
//			"main": {
//				controller: 'HomeCtrl',
//				templateUrl: 'home/login.tpl.html'
//			}
//		}
//	});
})

.controller( 'HomeCtrl', function HomeController( $scope, titleService ) {
	titleService.setTitle('Home');
//})
//.controller( 'LoginCtrl', function LoginController( $scope, $rootScope, $http ) {
    $scope.loginUser = function() {
       var url = '/auth/login';
       console.log('loging in ..., url : '+url);
       $http.get(url)
       .then(function(res){
          $rootScope.currentUser = res.user;
          console.log('login found : '+res.user);
        });
    }

    $scope.getUser = function() {
       var url = '/auth/get_user';
       console.log('get_user in ..., url : '+url);
       $http.get(url)
       .then(function(res){
           
          $rootScope.currentUser = res.user;
          console.log('login found : '+res.user);
        });
    }

})

;