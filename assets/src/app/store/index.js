angular.module( 'kombi.store', [
])

.config(function config( $stateProvider ) {
    $stateProvider.state( 'store', {
        url: '/store',
        views: {
            "main": {
                controller: 'StoreController',
                templateUrl: 'store/index.tpl.html'
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

.controller( 'StoreController', function MessagesController( $scope, $rootScope, $sailsSocket, lodash, config, titleService ) {
    titleService.setTitle('Store');
    $scope.menuSelection = 0;
    $scope.menuPage = LIST;
//    $scope.newMessage = {};
//    $scope.messages = messages;
    $scope.currentUser = config.currentUser;

//    $sailsSocket.subscribe('message', function (envelope) {
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