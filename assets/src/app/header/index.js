angular.module( 'kombi.header', [
])

.controller( 'HeaderCtrl', function HeaderController( $scope, $state, config, $timeout, $location, $rootScope, $window, $http, CService, TSvc, AssetSvc ) {
//    TSvc.initialize();
    $scope.currentUser = config.currentUser;
    $scope.getUser = function() {
       $http({ method:'get', url:'/auth/get_user'}).success(function (res) {
          console.log('get_user found : '+JSON.stringify(res));
          $rootScope.currentUser = res.user;
          console.log('get_user found : '+$rootScope.currentUser);
        }).error(function (errResponse, status) {
//           $timeout(function(){ 
//               $scope.$apply(function() {
                  $location.path('/login');
//                });
//            },1);
        });
        
    }
    $scope.getUser2 = function(cb, err) {
       $http({ method:'get', url:'/auth/get_user'}).success(function (res) {
          console.log('get_user found : '+JSON.stringify(res));
          $rootScope.currentUser = res.user;
          console.log('get_user found : '+$rootScope.currentUser);
          cb();
        }).error(function (errResponse, status) {
           err();
//            $location.path('/login');
        });
        
    }

    $scope.networkChanged = function(sn) {
        console.log('HeaderCtrl networkChanged : '+sn);
        CService.switchNetwork(sn);
        AssetSvc.initialize();
    }
    console.log('HeaderCtrl init config : '+JSON.stringify(config));
    
    console.log('... rootScope : '+$rootScope);
    $scope.getNetworks = function() {
       $http.get('/dsn/networks')
       .then(function(res){
          $scope.networks = res.data;
          $scope.nc = 0;
          if ($scope.networks) {
               $scope.nc = $scope.networks.length;
          }
          console.log('getNetworks found : '+$scope.networks.length);
          $rootScope.selectedNetwork = $scope.networks[0];
          $scope.networkChanged($scope.networks[0]);
//          AssetSvc.initialize($scope.networks[0]);
        });
    }
    var navItems = [];
    $scope.networkCount = function() {
        var nc = 0;
        if ($scope.networks) {
            nc = $scope.networks.length;
        }
        console.log('networkCount returning : '+nc);
        return nc;
    }
    $scope.getUser2(
        function() {
            navItems = [
                {title: 'Network', translationKey: 'navigation:network', url: '/network', cssClass: 'fa fa-bolt'},
                {title: 'Kinetic', translationKey: 'navigation:mobility', url: '/mobility', cssClass: 'fa fa-phone'},
                {title: 'Konsious', translationKey: 'navigation:observation', url: '/observation', cssClass: 'fa fa-eye'},
                {title: 'Kaptivate', translationKey: 'navigation:marketability', url: '/marketability', cssClass: 'fa fa-ticket'},
                {title: 'Store', translationKey: 'navigation:store', url: '/store', cssClass: 'fa fa-shopping-cart'},
                {title: 'About', translationKey: 'navigation:about', url:'/about',cssClass: 'fa fa-info-circle'}
    //            ,{title: 'MyAccount', translationKey: 'navigation:store', url:'/account',cssClass: 'fa fa-key'}
            ];
            console.log('HeaderCtrl navigating to /home');
            $scope.navItems = navItems;
            $location.path('/home');
        },
        function() {
            navItems.push({title: 'Register', translationKey: 'navigation:register', url: '/register', cssClass: 'fa fa-briefcase'});
            $scope.navItems = navItems;

            $location.path('/login');
        }
    
    );
//    if (!$rootScope.currentUser) {
//        navItems.push({title: 'Register', translationKey: 'navigation:register', url: '/register', cssClass: 'fa fa-briefcase'});
////        navItems.push({title: 'Login', translationKey: 'navigation:login', url: '/login', cssClass: 'fa fa-sign-in'});
////        console.log('HeaderCtrl navigating to /login');
////        $location.path('/login');
//        $location.path('/login');
//    } else {
//        navItems = [
//            {title: 'Network', translationKey: 'navigation:network', url: '/network', cssClass: 'fa fa-bolt'},
//            {title: 'Kinetic', translationKey: 'navigation:mobility', url: '/mobility', cssClass: 'fa fa-phone'},
//            {title: 'Konsious', translationKey: 'navigation:observation', url: '/observation', cssClass: 'fa fa-eye'},
//            {title: 'Kaptivate', translationKey: 'navigation:marketability', url: '/marketability', cssClass: 'fa fa-ticket'},
//            {title: 'Store', translationKey: 'navigation:store', url: '/store', cssClass: 'fa fa-shopping-cart'},
//            {title: 'About', translationKey: 'navigation:about', url:'/about',cssClass: 'fa fa-info-circle'}
////            ,{title: 'MyAccount', translationKey: 'navigation:store', url:'/account',cssClass: 'fa fa-key'}
//        ];
//        console.log('HeaderCtrl navigating to /home');
//        $location.path('/home');
//    }
//    $scope.navItems = navItems;
});