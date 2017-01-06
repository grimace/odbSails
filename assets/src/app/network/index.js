angular.module( 'kombi.network', [
])

.config(function config( $stateProvider ) {
    $stateProvider.state( 'network', {
        url: '/network',
        views: {
            "main": {
                controller: 'NetworkController',
                templateUrl: 'network/index.tpl.html'
            }
        }
    });
})
.controller("MediaController", function ($scope, $rootScope, $http, $filter, CService) {
        $scope.pages = [];

//    $scope.media = [];
//    $scope.pagedMedia = [];
//    $scope.currentPage = 1;
//    $scope.numPerPage = 20;
//    $scope.itemsPerPage = 12;
    
    $scope.initialize = function() {
        console.log('companyInfo : '+JSON.stringify($scope.imageName));
//        $rootScope.companyInfo[$scope.imageName] = '/images/ATM-Small.png';
        console.log('companyInfo : '+JSON.stringify($rootScope.companyInfo));
    }
    $scope.closeDialog = function() {
        $scope.imageName = '';
        $scope.selectedImage = '';
        $scope.closeThisDialog();
    }

    $scope.initMediaNot = function() {
        console.log('initMedia!');
        $scope.getMedia();
//        $scope.figureOutMediaToDisplay();

    }
    
    $scope.getMedia = function() {
       var url = '/dsn/media';
       if ($rootScope.selectedNetwork) {
           url+='?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       }
       console.log('getting media, url : '+url);
       $http.get(url)
       .then(function(res){
          $scope.media = res.data;
          $scope.searchMedia();
          console.log('getMedia found : '+$scope.media.length);
        });
    }

    $scope.getMediaMC = function() {
       var url = '/dsn/media';
       if ($rootScope.selectedNetwork) {
           url+='?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       }
       console.log('MediaController -> getting media, url : '+url);
       $http.get(url)
       .then(function(res){
          $scope.media = res.data;
          $scope.searchMedia();
          console.log('MediaController -> getMedia found : '+$scope.media.length);
        });
        
    }
    
    
    $scope.searchMedia = function () {
        console.log('searchMedia1, query : '+$scope.query);
        
        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
//            for (var i=0; i < $scope.media.length; i++) {
//                
//            }
            for(var attr in item) {
//                console.log('searchMedia item : '+item.name);
//                if (searchMatch(item[attr], $scope.query)) {
                if (searchMatch(item.name, $scope.query)) {
//                    console.log('searchMedia returning true');
                    return true;
                }
            }
            console.log('searchMedia returning false');
            return false;
        });
        console.log('searchMedia Called '+$scope.filteredMedia.length);
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentPage = 1;
        // now group by pages
//        $scope.groupToPages();
        $scope.figureOutMediaToDisplay();
    };

    var searchMatch = function (haystack, needle) {
//        console.log('searchMatch haystack : '+haystack+'  ,  needle : '+needle);
        
        if (!needle) {
            return true;
        }
//        console.log('searchMatch looking for : '+needle);
//        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;

        console.log('searchMatch looking for : '+haystack+' & '+needle);
        var ret = (haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1);
        console.log('searchMatch found : '+ret);
        return ret;

//        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

//    $scope.selectPage = function(page) {
//       console.log('selectPage() --->');
//        $scope.currentPage = page.number;
//        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
//        var end = begin + $scope.itemsPerPage;
//        $scope.pages = $scope.media.slice(begin, end);
//       console.log('selectPage() pages : '+$scope.pages.length);
//    };
    $scope.figureOutMediaToDisplay = function() {
        
        
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var src = $scope.media;
        if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
            console.log('figureOutMediaToDisplay building pages '+$scope.filteredMedia.length);
            src = $scope.filteredMedia;
        }

        console.log('figureOutMediaToDisplay() : '+begin+' , '+end);
        $scope.pages = src.slice(begin, end);
//        $scope.pages = $scope.media.slice(begin, end);
//        console.log('figureOutMediaToDisplay() pages : '+JSON.stringify($scope.pages));
    };

    
})
.controller( 'NetworkController', 
            function ($rootScope, $scope, $controller,  GS, $document, $window, saNavigationGuard, ngDialog, $timeout, $compile, $http, Upload, ScopeMap, $filter, titleService, CService, TSvc ) {

    var sortingOrder = 'name';
    $scope.loaded = false;
    $scope.dropText = 'Drop media files here...'
    $scope.file;
    $scope.files = [];
    $scope.media = [];
    $scope.sortingOrder = sortingOrder;
    $scope.reverse = false;
    $scope.filteredMedia = [];
    $scope.pages = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 12;
    $scope.itemsPerPage = 12;
    $scope.maxSize = 5;
    $scope.selectedImage = '';
    $scope.imageId = '';
    $scope.query = '';
//    $scope.CS = CService;
    
    $scope.initMedia = function() {
        console.log('initMedia!');
        $scope.getMedia();
//        $scope.figureOutMediaToDisplay();

    }

    $scope.getMedia = function() {
       var url = '/dsn/media';
       if ($rootScope.selectedNetwork) {
           url+='?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       }
       console.log('getting media, url : '+url);
       $http.get(url)
       .then(function(res){
          $scope.media = res.data;
          $scope.searchMedia();
          console.log('getMedia found : '+$scope.media.length);
        });
    }

    $scope.getMediaD = function(width, height, min) {
            console.log('getMediaD - width : '+width+' , height : '+height+' , min : '+min);
//            $scope.media = [];

            var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id)+'&width='+width+'&height='+height+'&min='+min;
//            if ($scope.selectedRegion && $scope.selectedRegion.name) {
//                console.log('getMedia search with type : '+$scope.selectedRegion);
//                url += '?type='+$scope.selectedRegion.name;
//            }
           $http.get(url)
           .then(function(res){
              console.log('getMedia results : '+res.data.length);
              $scope.media = [];
              for (var idx=0; idx < res.data.length; idx++) {
                var asset = res.data[idx];
                asset.id = asset._id.toString();
                delete asset._id;
                $scope.media.push(asset);                
              }
              $scope.searchMedia();
         });
    }


//    $scope.filteredTodos = [];
//    $scope.itemsPerPage = 30;
//    $scope.currentPage = 4;

    titleService.setTitle('Network');

    // new pagination stuff
    
    $scope.figureOutMediaToDisplay = function() {
        
        
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var src = $scope.media;
        if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
            console.log('figureOutMediaToDisplay building pages '+$scope.filteredMedia.length);
            src = $scope.filteredMedia;
        }

        console.log('figureOutMediaToDisplay() : '+begin+' , '+end);
        $scope.pages = src.slice(begin, end);
//        $scope.pages = $scope.media.slice(begin, end);
//        console.log('figureOutMediaToDisplay() pages : '+JSON.stringify($scope.pages));
    };


    $scope.pageChanged = function(page) {
        $scope.currentPage = page;
        console.log('pageChanged() : '+page);
        $scope.figureOutMediaToDisplay();
    };

//    $scope.$watch("currentPage + numPerPage", function() {
//        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
//        , end = begin + $scope.numPerPage;
//
//        $scope.pages = $scope.media.slice(begin, end);
//    });
//    $scope.selectPage = function(page) {
//       console.log('selectPage() --->');
//        $scope.currentPage = page;
////        $scope.currentPage = page;
//        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
//        var end = begin + $scope.itemsPerPage;
//        $scope.pages = $scope.media.slice(begin, end);
//       console.log('selectPage() pages : '+$scope.pages.length);
//    };

    // ^^^^^^^^ new pagination stuff
    
    
    $scope.r = new Flow({
        target: '/network/upload',
        chunkSize: 1024*1024,
        testChunks: false
    });

    
//    $rootScope.companyInfo = {
//        id: '',
//        logo: {src:'/images/320x60.png',width:'',height:''},
//        ctitle: '',
//        address: '',
//        phone: '',
//        web: '',
//        cimage: {src:'/images/320x320.png',width:'',height:''},
//        mtitle: '',
//        info: '',
//        mimage: {src:'/images/640x480.png',width:'',height:''},
//        bgimage: {src:'/images/background.png',width:'',height:''}
//    };
    $rootScope.companyInfoDirty = false;
    
    $scope.resetCompanyInfo = function() {
        console.log('resetCompanyInfo()');
        $scope.selectedImage ='';
        $scope.image = '';
        CService.resetCompanyInfo();
//        $rootScope.companyInfo = {};
//        $rootScope.companyInfo.id = '';
//        $rootScope.companyInfo.logo = {path:'/images/320x60.png',width:'',height:''};
//        $rootScope.companyInfo.ctitle ='';
//        $rootScope.companyInfo.address ='';
//        $rootScope.companyInfo.phone ='';
//        $rootScope.companyInfo.web ='';
//        $rootScope.companyInfo.cimage= {path:'/images/320x320.png',width:'',height:''};
//        $rootScope.companyInfo.mtitle ='';
//        $rootScope.companyInfo.info ='';
//        $rootScope.companyInfo.mimage= {path:'/images/640x480.png',width:'',height:''};
//        $rootScope.companyInfo.bgimage= {path:'/images/background.png',width:'',height:''};

    }

    $scope.resetImage = function(name) {
        CService.resetImage(name);
//        console.log('resetImage() : '+name);
//        switch (name) {
//            case 'logo':
//                $rootScope.companyInfo.logo.src = '/images/320x60.png';
//                break;
//            case 'cimage':
//                $rootScope.companyInfo.cimage.src = '/images/320x320.png';
//                break;
//            case 'mimage':
//                $rootScope.companyInfo.mimage.src = '/images/640x480.png';
//                break;
//            case 'bgimage':
//                $rootScope.companyInfo.bgimage.src = '/images/background.png';
//                break;
//        }
//        $rootScope.selectedAsset.name = '';
//        $rootScope.imageName = '';
//        $rootScope.selectedAsset = '';
//        $rootScope.selectedImage = '';
        $scope.closeThisDialog();
    }
    
    $scope.saveCompanyInfo = function() {
        CService.saveCompanyInfo();
//        console.log('saveCompanyInfo : '+JSON.stringify($rootScope.companyInfo));
//
//        var url = '/network/saveCompanyInfo'; 
//        if ($rootScope.companyInfo.id) {
//            url+='?cid='+$$rootScope.companyInfo.id;
//        }
//        $rootScope.companyInfo.network = $rootScope.selectedNetwork.id;
//        $http({
//            url: url,
//            method: "POST",
//            data: $rootScope.companyInfo,
//            headers: {'Content-Type': "application/json" }
//        }).success(function (response) {
//            $rootScope.companyInfo = response.data;
//            console.log('saveCompanyInfo returned response : '+JSON.stringify(response));
////            callback(response);
//            // refresh layouts on page
////            $scope.getLayouts();
//        });    
    }

    $scope.validateNothing = function(value) {
        console.log('validateNothing : '+JSON.stringify($rootScope.companyInfo));
//        console.log('you are here with : '+value);    
        return value;
    }

    $scope.validateTextNothing = function(value) {
        console.log('you are here with : '+value);    
        return value;
    }

    $scope.loadCompanyInfo = function() {
       $scope.selectedImage ='';
       $scope.image = '';
       CService.loadCompanyInfo();
//       var url = '/network/companyInfo?nid='+$rootScope.selectedNetwork.id;
//       console.log('loadCompanyInfo, url : '+url);
//       $http.get(url)
//       .then(function(res){
//           if (res.data) {
//               console.log('loadCompanyInfo returned : '+JSON.stringify(res.data));
//               $rootScope.companyInfo = res.data;
//           } else {
//               console.log('resetCompanyInfo()');
//               CService.resetCompanyInfo();
//               //$scope.resetCompanyInfo();
//           }
//        });
    }

//    $scope.loadAssignImageTemplate = function(image) {
//        $scope.imageName = image;
//        $scope.selectedImage = '';
//        ngDialog.open({
//            template: '/templates/network/popups/assignMediaPopup.html',
//            showClose: false,
//            scope: $scope,
//            controller: $controller('MediaController', {$scope: $scope})
//        });
//    }
//

    $scope.showLibrary = function(image, width, height) {
        console.log('showLibrary - setting imageName : '+image+' , width : '+width+' , height : '+height);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = false;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        $rootScope.selectedImage = $scope.getSelectedImage();
//        $scope.selectedImage = '';
        var modal = ngDialog.open({
            template: '/templates/network/popups/libraryPopup.html',
            showClose: false,
            controller: $controller('NetworkController', {$scope: $scope})
            
        });
//            scope: $scope.$new(),
        
         // Wait for the dialog to close
         // When it closes, add to return value to the orders array
     modal.closePromise.then(function(res) {
//             if (res) {
//                 console.log('library close '+$scope.selectedAsset);
//                 console.log('showLibrary close result : '+JSON.stringify(res));
//                 var path = res.value;
//                 if (path) {
//                     $rootScope.companyInfo[$rootScope.imageName].src = path;
//                 } else {
//                     $rootScope.companyInfo[$rootScope.imageName].src = path;
//                 }
//                 
//             }
         });
    }

    $scope.openAddMediaDialog = function () {
        var width = $rootScope.fixedWith;
        var height = $rootScope.fixedHeight;
        console.log('openAddMediaDialog : '+width+' , '+height);
        ngDialog.open({
            template: '/templates/dsn/popups/mediaTemplate.html',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };

    
    $scope.loadAssignImageTemplate = function(image) {
        $scope.selectedImage = $scope.getSelectedImage();
        ngDialog.open({
            template: '/templates/network/popups/assignMediaPopup.html',
            showClose: false,
            scope: $scope,
            controller: $controller('MediaController', {$scope: $scope})
        });
    }

//    $scope.assignImage = function () {
//        console.log('assignImage, name : '+$scope.selectedAsset.name);
//        $rootScope.companyInfo[$scope.imageName].src = $scope.selectedAsset.path;
//        $rootScope.companyInfoDirty = true;
//        console.log('... companyInfo : '+JSON.stringify($rootScope.companyInfo));
//        $scope.closeThisDialog($scope.selectedAsset.path);
//    };

    $scope.assignImage = function () {
        console.log('assignImage, name : '+$rootScope.selectedAsset.name);
        $rootScope.companyInfo[$scope.imageName].name = $rootScope.selectedAsset.name;
        $rootScope.companyInfo[$scope.imageName].path = $rootScope.selectedAsset.path;
        $rootScope.companyInfo[$scope.imageName]._id = $rootScope.selectedAsset._id;
        $rootScope.companyInfo[$scope.imageName].id = $rootScope.selectedAsset.id;
        $rootScope.companyInfo[$scope.imageName].size = $rootScope.selectedAsset.size;
        $rootScope.companyInfo[$scope.imageName].width = $rootScope.selectedAsset.width;
        $rootScope.companyInfo[$scope.imageName].height = $rootScope.selectedAsset.height;
        $rootScope.companyInfoDirty = true;
        $rootScope.imageName = '';
        $rootScope.selectedAsset = '';
        $rootScope.selectedImage = '';
        console.log('assignImage : companyInfo : '+JSON.stringify($rootScope.companyInfo));
        $scope.closeThisDialog();
    };

    $scope.init = function() {
        console.log('NetworkController.init()');
        var ms = ScopeMap.get('network.menuSelection');
        if (ms) {
            console.log("NetworkController.init() setting menuSelection to : "+ms);
            $scope.menuSelection = ms.screen;
            $scope.menuPage = ms.page;
            $scope.loaded = true;
        } else {
            $scope.loaded = false;
            console.log("NetworkController.init() setting menuSelection to 0");
            $scope.menuSelection = 0;
            $scope.menuPage = 0;
            ScopeMap.store('network.menuSelection', { screen : $scope.menuSelection, page : $scope.menuPage });
        }
    }

//    $scope.assignImage = function () {
//        console.log('assignImage, name : '+$scope.imageName+' image : '+$scope.selectedAsset.name);
//        $rootScope.companyInfo[$scope.imageName].src = $scope.selectedAsset.path;
//        $rootScope.companyInfoDirty = true;
//        console.log('... companyInfo : '+JSON.stringify($rootScope.companyInfo));
////        $scope.closeThisDialog();
//    };

//    $scope.templates =
//       [ 
//        [{name: 'dash.html', url: '/templates/network/dash.html'}],
//        [{name: 'company.html', url: '/templates/network/company.html'}],
//        [{name: 'analytics.html', url: '/templates/network/analytics.html'}],
//        [{name: 'operations.html', url: '/templates/network/operations.html'}],
//        [{name: 'displays.html', url: '/templates/network/displays.html'}]
//        ];
    
    var ms = ScopeMap.get('network.menuSelection');
    if (ms) {
        $scope.menuSelection = ms.screen;
        $scope.menuPage = ms.page;
    }
 
    var navigationGuardian = function() {
        console.log('storing menuSelection')
        ScopeMap.store('network.menuSelection', { screen : $scope.menuSelection, page : $scope.menuPage });
        return undefined;
    };
    
    saNavigationGuard.registerGuardian(navigationGuardian);

    $scope.getMedia = function() {
       var url = '/dsn/media';
       if ($rootScope.selectedNetwork) {
           url+='?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       }
       console.log('getting media, url : '+url);
       $http.get(url)
       .then(function(res){
          $scope.media = res.data;
          $scope.searchMedia();
          console.log('getMedia found : '+$scope.media.length);
        });
    }
//
//    $scope.view = {
//        setView: function() {
//            
//            var ms = ScopeMap.store('network.menuSelection', {screen : $scope.menuSelection, page: $scope.menuPage});
//            if (ms) {
//                    $scope.menuSelection = ms.screen;
//                    $scope.menuPage = ms.page;
//            }
//            $scope.setTemplate();
//            return $scope.template.url;
//            
//        },
//        getView: function(v) {
//                $scope.menuSelection = v;
//                $scope.setTemplate();
//                return $scope.template.url;
//        }
//    };
    $scope.template = $rootScope.mTemplates[NETWORK][$scope.menuSelection];
//    $scope.view = {
//        setView: function() {
//            $scope.template = $rootScope.mTemplates[NETWORK][$scope.menuSelection];
//            console.log('MobileController.setView : '+$scope.template.url);
//            return $scope.template.url;
//        },
//        getView: function(v) {
//            $scope.menuSelection = v;
//            $scope.template = $rootScope.mTemplates[NETWORK][$scope.menuSelection];
//            console.log('MobileController.getView : '+$scope.template.url);
//            return $scope.template.url;
//        }
//    };
    
    
    $scope.view = {
        setView: function() {
            var ms = ScopeMap.store('network.menuSelection', {screen : $scope.menuSelection, page: $scope.menuPage});
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
        var tList = $rootScope.mTemplates[NETWORK][$scope.menuSelection];
        if (!$scope.menuPage || $scope.menuPage >= tList.length) {
            $scope.menuPage = 0;
        }
        if ($scope.menuPage >= tList.length) {
            $scope.menuPage = 0;
        }
        $scope.template = tList[$scope.menuPage];
    }
    $scope.setTemplate();

    $scope.updateItem = function(name, value) {
        var item = $rootScope.companyInfo[name];
        item.src = value;
        console.log('after updateItem1 : '+JSON.stringify(item));

//        name.src = value;
        console.log('after updateItem : '+JSON.stringify($rootScope.companyInfo));
    }
    
    $scope.childOnLoad = function() {
        console.log('NetworkController.childOnLoad');
    };

    $scope.dashLoaded = function() {
        $window.initComponents();
    };

    $scope.childOnLoad = function() {
            console.log('DSNController.childOnLoad');
//            initComponents();
    };

//    $scope.initPopup = function() {
//        $scope.getMedia();
//    }

    $scope.closeDialog = function() {
        $scope.imageName = '';
        $scope.selectedImage = '';
        $scope.closeThisDialog();
    }
    
//    $scope.showLibrary = function() {
//        $scope.updateItem($scope.imageName, '/images/ATM-Small.png');
//        console.log('Show Library Called - companyInfo : '+JSON.stringify($rootScope.companyInfo));
////        console.log('Show Library Called : '+$scope.imageName+' , /images/ATM-Small.png');
//    }

    $scope.help = function() {
        console.log('Help Called - companyInfo : '+JSON.stringify($rootScope.companyInfo));
        
//        $scope.updateItem($scope.imageName, '/images/ATM-Small.png');
//        console.log('Help Called - companyInfo : '+JSON.stringify($rootScope.companyInfo));
    }

    var searchMatch = function (haystack, needle) {
        console.log('searchMatch haystack : '+haystack+'  ,  needle : '+needle);
        
        if (!needle) {
            return true;
        }
        console.log('searchMatch looking for : '+needle);
        var ret = (haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1);
        console.log('searchMatch found : '+ret);
        return ret;
//        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
//        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

    
          // init the filtered items
//    $scope.searchMedia = function () {
//        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
//            for(var attr in item) {
//                console.log('searchMedia item : '+JSON.stringify(item));
//                if (searchMatch(item[attr], $scope.query)) {
//                    console.log('searchMedia returning true');
//                    return true;
//                }
//            }
//            console.log('searchMedia returning false');
//            return false;
//        });
//        console.log('searchMedia Called '+$scope.filteredMedia.length);
//        // take care of the sorting order
//        if ($scope.sortingOrder !== '') {
//            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
//        }
//        $scope.currentPage = 1;
//        // now group by pages
////        $scope.groupToPages();
//        $scope.figureOutMediaToDisplay();
//    };

//    this.$inject = ['$scope','$filter'];

    $scope.getMediaLength = function() {
        var l = 0;
        var src = $scope.media;
        if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
            console.log('getMediaLength returning '+$scope.filteredMedia.length);
            src = $scope.filteredMedia;
        }
        if (src) {
            l = src.length;
        }
        return l;
    }
       // calculate page in place
    $scope.groupToPages = function () {
        
        var src = $scope.media;
        if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
            console.log('groupToPages clearing pages '+$scope.filteredMedia.length);
            src = $scope.filteredMedia;
        }
        $scope.pages = [];
//            for (var i = 0; i < $scope.filteredMedia.length; i++) {
        for (var i = 0; i < $scope.itemsPerPage; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pages[Math.floor(i / $scope.itemsPerPage)] = [ src[i] ];
            } else {
                $scope.pages[Math.floor(i / $scope.itemsPerPage)].push( src[i] );
            }

//            if (i % $scope.itemsPerPage === 0) {
//                $scope.pages[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredMedia[i] ];
//            } else {
//                $scope.pages[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredMedia[i]);
//            }
        }
        $scope.figureOutMediaToDisplay();
    };
    
    $scope.updateMediaList = function() {
        var url = '/dsn/media?nid='+$rootScope.selectedNetwork.id+'&type=image'; 
        console.log('updateMediaList for : '+$scope.selectedRegion.name);
        $http.get(url)
        .then(function(res) {
              console.log('updateMediaList results : '+res.data.length);
              $scope.media = res.data;                
        });
    }

    $scope.range = function (start, end) {
        var ret = [];
        if (!end) {
            end = start;
            start = 0;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };
    
    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };
    
    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pages.length - 1) {
            $scope.currentPage++;
        }
    };
    
    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };

    $scope.setSelected = function(asset) {
       $rootScope.selectedAsset = asset;
       $rootScope.selectedImage = asset.path;
       console.log('selected');
       if ($rootScope.lastSelected) {
         $rootScope.lastSelected.selected = '';
       }
       this.selected = 'stupid';
       $rootScope.lastSelected = this;
    }
    
    $scope.getSelectedImage = function() {
        console.log('getting selected Image...');
        var item = $rootScope.companyInfo[$rootScope.imageName];
        var value = item.src;
        if ($rootScope.selectedImage) {
            value = $rootScope.selectedImage;
        }
        console.log('getSelectedImage : '+value);
        return value;
    }

    $scope.searchMedia = function () {
        console.log('searchMedia1, query : '+$scope.query);
        
        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
//            for (var i=0; i < $scope.media.length; i++) {
//                
//            }
            for(var attr in item) {
//                console.log('searchMedia item : '+item.name);
//                if (searchMatch(item[attr], $scope.query)) {
                if (searchMatch(item.name, $scope.query)) {
//                    console.log('searchMedia returning true');
                    return true;
                }
            }
            console.log('searchMedia returning false');
            return false;
        });
        console.log('searchMedia Called '+$scope.filteredMedia.length);
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentPage = 1;
        // now group by pages
//        $scope.groupToPages();
        $scope.figureOutMediaToDisplay();
    };
    var searchMatch = function (haystack, needle) {
//        console.log('searchMatch haystack : '+haystack+'  ,  needle : '+needle);
        
        if (!needle) {
            return true;
        }
//        console.log('searchMatch looking for : '+needle);
//        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;

        console.log('searchMatch looking for : '+haystack+' & '+needle);
        var ret = (haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1);
        console.log('searchMatch found : '+ret);
        return ret;

//        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

});