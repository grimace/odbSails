angular.module( 'kombi.mobility', [
])

.config(function config( $stateProvider ) {
    $stateProvider.state( 'mobility', {
        url: '/mobility',
        views: {
            "main": {
                controller: 'MobilityController',
                templateUrl: 'mobility/index.tpl.html'
            }
        }
//        ,
//        resolve: {
//            messages: function(MessageModel) {
//                return MessageModel.getAll().then(function(models) {
//                    return models;
//                });
//            }
//        }
    });
})

.controller( 'MobilityController', function MobilityController( $rootScope, $scope, saNavigationGuard, $sailsSocket, lodash, config, titleService, ScopeMap ) {
    titleService.setTitle('Mobility');
//    $scope.currentUser = config.currentUser;
    $scope.menuSelection = 0;
    $scope.menuPage = LIST;

//    $scope.templates =
//       [ 
//        [{name: 'coupons.html', url: '/templates/mobile/coupons.html'}],
//        [{name: 'addform.html', url: '/templates/mobile/addform.html'}],
//        [{name: 'campaigns.html', url: '/templates/mobile/campaigns.html'}],
//        [{name: 'distributions.html', url: '/templates/mobile/distributions.html'}],
//        [{name: 'events.html', url: '/templates/mobile/events.html'}],
//        [{name: 'hosted.html', url: '/templates/mobile/hosted.html'}],
//        [{name: 'media.html', url: '/templates/mobile/media.html'}],
//        [{name: 'offers.html', url: '/templates/mobile/offers.html'}],
//        [{name: 'redemptions.html', url: '/templates/mobile/redemptions.html'}],
//        [{name: 'rules.html', url: '/templates/mobile/rules.html'}],
//        [{name: 'schedule.html', url: '/templates/mobile/schedule.html'}]
//        ];
    
    var ms = ScopeMap.get('mobility.menuSelection');
    if (ms) {
        $scope.menuSelection = ms.screen;
        $scope.menuPage = ms.page;
    }
 
    var navigationGuardian = function() {
        console.log('storing menuSelection');
        ScopeMap.store('mobility.menuSelection', { screen : $scope.menuSelection, page : $scope.menuPage });
        return undefined;
    };
    
    saNavigationGuard.registerGuardian(navigationGuardian);

    
    $scope.view = {
        setView: function() {
            
            var ms = ScopeMap.store('mobility.menuSelection', {screen : $scope.menuSelection, page: $scope.menuPage});
            if (ms) {
                    $scope.menuSelection = ms.screen;
                    $scope.menuPage = ms.page;
            }
            $scope.setTemplate();
            return $scope.template.url;
            
        },
        getView: function(v) {
                $scope.menuSelection = v;
                $scope.setTemplate();
                return $scope.template.url;
        }
    };
    $scope.setTemplate = function() {
        if (!$scope.menuSelection) {
            $scope.menuSelection = 0;
        }
        var tList = $rootScope.templates[MOBILITY][$scope.menuSelection];
        if (!$scope.menuPage || $scope.menuPage >= tList.length) {
            $scope.menuPage = 0;
        }
        if ($scope.menuPage >= tList.length) {
            $scope.menuPage = 0;
        }
        $scope.template = tList[$scope.menuPage];
    }
    $scope.setTemplate();

    $scope.childOnLoad = function() {
        console.log('MobilityController.childOnLoad');
    };

    
//    $sailsSocket.subscribe('mobility', function (envelope) {
//        switch(envelope.verb) {
//            case 'created':
//                $scope.messages.unshift(envelope.data);
//                break;
//            case 'destroyed':
//                lodash.remove($scope.messages, {id: envelope.id});
//                break;
//        }
//    });
//
//    $scope.destroyMessage = function(message) {
//        // check here if this message belongs to the currentUser
//        if (message.user.id === config.currentUser.id) {
//            MessageModel.delete(message).then(function(model) {
//                // message has been deleted, and removed from $scope.messages
//            });
//        }
//    };
//
//    $scope.createMessage = function(newMessage) {
//        newMessage.user = config.currentUser.id;
//        MessageModel.create(newMessage).then(function(model) {
//            $scope.newMessage = {};
//        });
//    };

});