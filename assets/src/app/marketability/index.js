angular.module( 'kombi.marketability', [
]).config(function config( $stateProvider ) {
    $stateProvider.state( 'marketability', {
        url: '/marketability',
        views: {
            "main": {
                controller: 'DSNController',
                templateUrl: 'marketability/index.tpl.html'
            }
        }
    });
})
.controller("DSNController", 
    function (
        $rootScope, 
        $scope, 
        GS, 
        $document, 
        $window, 
        saNavigationGuard, 
        ngDialog, 
        $timeout, 
        $compile, 
        $http, Upload, ScopeMap, $filter, titleService, CService, $controller, TSvc, $location, AssetSvc, calendarConfig ) {

    titleService.setTitle('Marketability');
    $scope.newMessage = {};

    var sortingOrder = 'name';
    $scope.loaded = false;
    $scope.dropText = 'Drop media files here...'
    $scope.file;
    $scope.files = [];
    $scope.calendarView = 'month';
    $scope.calendarDay = new Date();
    $scope.viewDate = new Date();
    $scope.media = [];
    $scope.sortingOrder = sortingOrder;
    $scope.reverse = false;
    $scope.filteredMedia = [];
    $scope.filteredProducts = [];
    $scope.pages = [];
    $scope.productPages = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 20;
    $scope.itemsPerPage = 12;
    $scope.maxSize = 5;
    $scope.menuSelection = 0;
    $scope.menuPage = LIST;
    $scope.CService = CService;
    $scope.query = '';
    $scope.productPageTitle = 'Create Product';
    $rootScope.groupView = { name:'product'};
    //AssetSvc.initialize();
    isCalendarCellOpen = true;
    
//    $rootScope.productGroupPageTitle = 'Create Product Group';
    $scope.hasLocation = function(obj) {
        if (obj && obj.location) {
            var location = obj.location;
            if (location.lat && location.lon) {
                return true;
            }
        }
        return false;
    }
    
    $scope.getLocation = function(obj) {
        var src = "/image/map.png";
        if (obj && obj.location) {
            var location = obj.location;
            if (location.lat && location.lon) {
                src =  location.mapImage.src;
            }
        }
        return src;
            
    }
    $scope.getPGPaginationCount = function() {
        if ($scope.groupView == 'product') {
            return $rootScope.productGroups.length;
        }
        return 0;
    }
    
    $scope.$watch('groupView.name', function() {
        console.log('groupView watch : '+$scope.groupView.name);    
    });
    
    $scope.hidePagination = function() {
        var pEl = angular.element( document.querySelector( '#ppagination' ) );
        var aEl = angular.element( document.querySelector( '#apagination' ) );
        var fEl = angular.element( document.querySelector( '#fpagination' ) );
        pEl.addClass('hidden'); 
        aEl.addClass('hidden'); 
        fEl.addClass('hidden'); 
    }
    
    $scope.cleanPath = function(asset) {
        var p = asset.path;
        return p.replace('/data/assets', '');    
    }
    
    $scope.showPagination = function(elName) {
        var el = angular.element( document.querySelector( elName ) );
        el.removeClass('hidden'); 
    }
    
    $scope.changeSelectedGroup = function(g) {
        console.log('changeSelectedGroup  : '+$scope.groupView.name);
        console.log('setting groupView : '+g);
        $rootScope.groupView.name = g;
    }

    $scope.gat = function() {
        if ($rootScope.groupView.name == 'product') {
            //console.log('viewProducts returning : true');
            return 'Product';
        }
        if ($rootScope.groupView.name == 'announcement') {
            //console.log('viewProducts returning : true');
            return 'Announcement';
        }
        if ($rootScope.groupView.name == 'feed') {
            //console.log('viewProducts returning : true');
            return 'Feed';
        }
            
    }
    
    $scope.saveProductGroup = function() {
        if ($rootScope.currentProductGroup) {
            console.log('saving display group: '+$rootScope.currentProductGroup);
            $rootScope.currentProductGroup.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveProductGroup';
            console.log("saveProductGroup : "+JSON.stringify($rootScope.currentProductGroup));
            if ($rootScope.currentProductGroup.id) {
                url+='?pgid='+encodeURIComponent($rootScope.selectedNetwork.id);
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentProductGroup,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
                $scope.menuPage = LIST;
                $scope.view.getView(GROUPS);
                console.log('currentWheel returned response : '+response);
            });    
        }
    };

    $scope.vp2 = function() {
        console.log('viewProducts  : '+$scope.groupView.name);
        if ($rootScope.groupView.name == 'product') {
            console.log('viewProducts returning : true');
            return true;
        }
        console.log('viewProducts returning : false');
        return false;
    }

    $scope.viewProducts = function() {
//        console.log('viewProducts  : '+$scope.groupView.name);
        if ($rootScope.groupView.name == 'product') {
            //console.log('viewProducts returning : true');
            return true;
        }
//        console.log('viewProducts returning : false');
        return false;
    }
    $scope.viewAnnouncements = function() {
        if ($rootScope.groupView.name == 'announcement') {
            return true;
        }    
        return false;
    }
    $scope.viewFeeds = function() {
        if ($rootScope.groupView.name == 'feed') {
            return true;
        }    
        return false;
    }
    
    $scope.getGroupList = function() {
        var gl = 'None';
        $scope.hidePagination();
        switch ($scope.$parent.groupView.name) {
            case 'product': 
                gl = 'Products';
                $scope.showPagination('#ppagination');
                break;
            case 'announcement': 
                gl = 'Announcements';
                $scope.showPagination('#apagination');
                break;
            case 'feed': 
                gl = 'Feeds';
                $scope.showPagination('#fpagination');
                break;
        }
        return gl;
    }

    // productGroup methods
    $scope.editProductGroup = function(productgroup) {
//        console.log('editProductGroup : '+JSON.stringify(productgroup));
        $rootScope.productGroupPageTitle = 'Edit Product Group';
        $rootScope.currentProductGroup = productgroup;

        $scope.menuPage = CREATE;
        $scope.view.getView(PRODUCTGROUPS);
        console.log('editProductGroup page title : '+$rootScope.productGroupPageTitle);
//        $scope.view.setView();

        
        
//        $scope.menuPage = CREATE;
//        $scope.view.gView(PRODUCTGROUPS, LIST);
//        $scope.view.setView();
//        console.log("openEditProductGroupDialog");

    }
    
    $scope.assignProducts = function(productgroup) {
        console.log('assignProducts : '+JSON.stringify(productgroup));
    }
    $scope.removeProductGroup = function(pgid) {
        
        console.log('removeProductGroup : '+JSON.stringify(pgid));
        var url = '/dsn/removeProductGroup?pgid='+pgid; 
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeProductGroup returned response : '+response);
//            $scope.getMedia();
//            $scope.events = [];
//            $scope.getSchedules();
//            $scope.$broadcast('calendar.refreshView');
        });    

    }

        // announcementGroup methods
    $scope.editAnnouncementGroup = function(announcementgroup) {
        console.log('editAnnouncementGroup : '+JSON.stringify(announcementgroup));
        
        $rootScope.announcementGroupPageTitle = 'Edit Announcement Group';
        $rootScope.currentAnnouncementGroup = announcementgroup;

        $scope.menuPage = CREATE;
        $scope.view.getView(ANNOUNCEMENTGROUPS);
        console.log('editProductGroup page title : '+$rootScope.productGroupPageTitle);

        
    }
    $scope.assignAnnouncements = function(announcementgroup) {
        console.log('assignAnnouncements : '+JSON.stringify(announcementgroup));
    }
    $scope.removeAnnouncementGroup = function(agid) {
        console.log('removeAnnouncementGroup : '+JSON.stringify(agid));
    }

        // productGroup methods
    $scope.editFeedGroup = function(feedgroup) {
        console.log('editFeedGroup : '+JSON.stringify(feedgroup));
    }
    $scope.assignFeeds = function(feedgroup) {
        console.log('assignFeeds : '+JSON.stringify(feedgroup));
    }
    $scope.removeFeedGroup = function(fgid) {
        console.log('removeFeedGroup : '+JSON.stringify(fgid));
    }

    $scope.validateDimensions = function($file, $width, $height) {
        console.log('validateDimensions : width : '+$width+' , height : '+$height);
        return true;
    }

    $scope.validateNothing = function(value) {
        console.log('validateNothing : '+JSON.stringify(value));
//        console.log('you are here with : '+value);    
        return value;
    }

    $scope.validateTextNothing = function(value) {
        console.log('you are here with : '+value);    
        return value;
    }

    $scope.getProductGroups = function() {
           $rootScope.productGroups = {};                
           var url = '/dsn/productGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
           $http.get(url)
           .then(function(res){
              $rootScope.productGroups = res.data;
               console.log('getProductGroups found : '+$rootScope.productGroups.length);
        });
    }
    $scope.getFeedGroups = function() {
           $rootScope.feedGroups = {};                
           var url = '/dsn/feedGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
           $http.get(url)
           .then(function(res){
              $rootScope.feedGroups = res.data;                
        });
    }
    $scope.getAnnouncementGroups = function() {
           $rootScope.announcementGroups = {};                
           var url = '/dsn/announcementGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
           $http.get(url)
           .then(function(res){
              $rootScope.announcementGroups = res.data;                
        });
    }

    $scope.loadGroups = function() {
        console.log('DSNController.loadGroups()');
        $scope.getProductGroups();
        $scope.getFeedGroups();
        $scope.getAnnouncementGroups();
    }

    $scope.getMimeImage = function(asset) {
        var imgSrc;
        console.log('getMimeImage : '+JSON.stringify(asset));
        if (asset.assetType == 'Folder') {
            imgSrc = '/images/folder.png';
        } else {
            imgSrc = asset.path.toLowerCase();
        }   
        return imgSrc;
    }
    
    $scope.validateFile = function(file) {
        console.log('validateFile : width : '+$rootScope.fixedWidth+' , height : '+$rootScope.fixedHeight+' , fixedMin : '+$rootScope.fixedMin);
        if ($rootScope.fixedWidth > 0 && $rootScope.fixedHeight > 0) {
            if (file.file.dimensions) {
                file.dimensions = file.file.dimensions;
                if ($rootScope.fixedMin) {
                    if (file.dimensions.width >= $rootScope.fixedWidth &&
                       file.dimensions.height >= $rootScope.fixedHeight) {//dimensions validator
                       alert('Image dimensions need to be at least : '+$rootScope.fixedWidth+' X '+$rootScope.fixedHeight);
                       return false;
                    }
                return true;// image is valid
                } else {
                    if (file.dimensions.width != $rootScope.fixedWidth &&
                       file.dimensions.height != $rootScope.fixedHeight) {//dimensions validator
                       alert('Image dimensions need to be : '+$rootScope.fixedWidth+' X '+$rootScope.fixedHeight);
                       return false;
                    }
                return true;// image is valid
                }
              }
              var fileReader = new FileReader();
              fileReader.readAsDataURL(file.file);
              fileReader.onload = function (event) {
                var img = new Image();
                img.onload = function() {
                  console.log(this.width + 'x' + this.height);
                  file.file.dimensions = {
                    width: this.width,
                    height: this.height
                  };
                  $scope.$flow.addFile(file.file);
                }
                img.src = event.target.result
              };
              return false;// do not add file to be uploaded    
        } else {
            // TODO : check for minWidth and minHeight;
            return true;
        }
    }
    $scope.logCurrentProduct  = function() {
        console.log('logCurrentProduct : '+JSON.stringify($rootScope.currentProduct));
    }
    $scope.getProductImage = function() {
        var value = '';
        console.log('getting selected Image...');
        var item = $rootScope.currentProduct[$rootScope.imageName];
        if (item) {
            var value = item.path;
            if ($rootScope.selectedImage) {
                value = $rootScope.selectedImage;
            }
            console.log('getSelectedImage : '+value);
        }
        return value;
    }

    $scope.getProductGroupImage = function() {
        var value = '';
        console.log('getting selected Image...');
        var item = $rootScope.currentProductGroup[$rootScope.imageName];
        if (item) {
            var value = item.path;
            if ($rootScope.selectedImage) {
                value = $rootScope.selectedImage;
            }
            console.log('getSelectedImage : '+value);
        }
        return value;
    }

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

    $scope.showLibraryC = function(target, image, width, height, min) {
        console.log('showLibraryC - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        var modal = ngDialog.open({
            template: '/templates/dsn/popups/libraryPopupC.html',
            showClose: false,
            className: 'ngdialog-theme-plain custom-height',
            controller: $controller('DSNController', {$scope: $scope})
            
        });
        
        modal.closePromise.then(function(res) {
             if (res  && res.value) {
                 var cimage = res.value;
                 var item = target[image];
                 item.src = cimage;
                 console.log('libraryC close '+item.src);
             }  else {
                 console.log('showLibraryC close null');
             }
            
         });
    }
    
    $scope.showLibrary2 = function(image, width, height, min) {
        console.log('showLibrary2 - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        $rootScope.selectedImage = $scope.getProductImage();
        var modal = ngDialog.open({
            template: '/templates/dsn/popups/libraryPopup2.html',
            showClose: false,
            className: 'ngdialog-theme-plain custom-height',
            controller: $controller('DSNController', {$scope: $scope})
            
        });
        
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

    $scope.showLibraryL = function(image, width, height, min) {
        console.log('showLibraryL - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        $rootScope.selectedImage = $scope.getProductImage();
        var modal = ngDialog.open({
            template: '/templates/dsn/popups/libraryPopupL.html',
            showClose: false,
//            className: 'ngdialog-theme-plain custom-height',
            className: 'ngdialog-theme-default custom-height-600',
            controller: $controller('DSNController', {$scope: $scope})
            
        });
        
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

    $scope.init = function() {
        $scope.getMedia();
        $scope.getLayouts();
        $scope.getWheels();
        var ms = ScopeMap.get('dsn.menuSelection');
        if (ms) {
            console.log("DSNController.init() setting menuSelection to : "+ms);
            $scope.menuSelection = ms.screen;
            $scope.menuPage = ms.page;
            $scope.loaded = true;
        } else {
            console.log("DSNController.init() setting menuSelection to 0");
            $scope.menuSelection = 0;    
            $scope.menuPage = 0;    
            var ms = ScopeMap.store('dsn.menuSelection', {screen : $scope.menuSelection, page: $scope.menuPage});
            $scope.loaded = false;
        }
        
    }
    
    $scope.getMediaD = function(width, height, min) {
//                var minimum  = (min) ?  1 : 0;
                console.log('getMediaD - width : '+width+' , height : '+height+' , min : '+min);
                $scope.media = [];
                
                
//                console.log('LayoutAssignController getMedia : '+JSON.stringify($rootScope.selectedNetwork));
                var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id)+'&width='+width+'&height='+height+'&min='+min;
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                        
                    console.log('getMedia search with type : '+$scope.selectedRegion);
                    url += '?type='+$scope.selectedRegion.name;
                }
               $http.get(url)
               .then(function(res){
                  console.log('getMedia results : '+res.data.length);
                  for (var idx=0; idx < res.data.length; idx++) {
                    var asset = res.data[idx];
                    asset.id = asset._id.toString();
                    delete asset._id;
                    $scope.media.push(asset);                
                  }
                  $scope.searchMedia();
             });
    }

    $scope.getMediaPageCount = function() {
        var count = $scope.getMediaLength()/$scope.itemsPerPage;
        return(Math.ceil(count));
    }
    $scope.getProductsPageCount = function() {
        var count = $scope.getProductsLength()/$scope.itemsPerPage;
        return(Math.ceil(count));
    }
    
    $scope.getMediaLength = function() {
        var l = 0;
        var src = $scope.media;
        if ($scope.query) {
            if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
                console.log('getMediaLength returning '+$scope.filteredMedia.length);
                src = $scope.filteredMedia;
            } else {
                src = [];
            }
        }
        if (src) {
            l = src.length;
        }
        return l;
    }
    $scope.getProductsLength = function() {
        var l = 0;
        var src = $rootScope.products;
        if ($scope.query) {
            if ($scope.filteredProducts && $scope.filteredProducts.length > 0) {
                console.log('getMediaLength returning '+$scope.filteredProducts.length);
                src = $scope.filteredProducts;
            } else {
                src = [];
            }
        }
        if (src) {
            l = src.length;
        }
        return l;
    }

    $scope.figureOutMediaToDisplay = function() {
        
        
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var src = $scope.media;
        if ($scope.query) {
            if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
    //            console.log('figureOutMediaToDisplay building pages '+$scope.filteredMedia.length);
                src = $scope.filteredMedia;
                $scope.pages = src.slice(begin, end);
            } else {
                $scope.pages = [];
            }
        } else {
            $scope.pages = src.slice(begin, end);
        }
//        console.log('figureOutMediaToDisplay() : '+begin+' , '+end);
//        $scope.pages = src.slice(begin, end);
//        $scope.pages = $scope.media.slice(begin, end);
//        console.log('figureOutMediaToDisplay() pages : '+JSON.stringify($scope.pages));
    };

    $scope.figureOutProductsToDisplay= function() {
        
        var begin = (($scope.currentProductsPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var src = $rootScope.products;
        if ($scope.query) {
            if ($scope.filteredProducts && $scope.filteredProducts.length > 0) {
                src = $scope.filteredProducts;
                $scope.productPages = src.slice(begin, end);
            } else {
                $scope.productPages = [];
            }
        } else {
            $scope.productPages = src.slice(begin, end);
        }
    };

    $scope.pageChanged = function(page) {
        $scope.currentPage = page;
//        console.log('pageChanged() : '+page);
        $scope.figureOutMediaToDisplay();
    };

    $scope.productsPageChanged = function(page) {
        $scope.currentProductsPage = page;
//        console.log('pageChanged() : '+page);
        $scope.figureOutProductsToDisplay();
    };

    $scope.getAssetThumb = function(asset) {
        
    }
    
    $scope.getUploadTarget = function() {
        var url = '/dsn/upload?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
        var  target = {target: url};
        return target;
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
    $scope.getNetworks = function() {
       $http.get('/dsn/networks')
       .then(function(res){
          $scope.networks = res.data;
          console.log('getNetworks found : '+$scope.networks.length);
        });
    }
    $scope.updatedMedia = function() {
        console.log('updateMedia()');
        $scope.getMedia();
        $scope.$apply();
    }

    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        if (!haystack) {
            return false;
        }
//        console.log('searchMatch - haystack : '+haystack+' , needle : '+needle);
        if (isNaN(haystack) && isNaN(needle)) {
            return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
        } else if (!isNaN(haystack) && !isNaN(needle)) {
            return parseInt(haystack) === parseInt(needle);
        } else {
            return false;
        }
    };

   $scope.search = function (row) {
        return (
            angular.lowercase(row.name).indexOf(angular.lowercase($scope.query) || '') !== -1 ||
            angular.lowercase(row.description).indexOf(angular.lowercase($scope.query) || '') !== -1 ||
            angular.lowercase(row.duration).indexOf(angular.lowercase($scope.query) || '') !== -1 ||
            angular.lowercase(row.tags).indexOf(angular.lowercase($scope.query) || '') !== -1
        
        );
    };
      // init the filtered items
    $scope.searchMedia = function () {
//        console.log('searchMedia, query : '+$scope.query);
        
        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
//            for (var i=0; i < $scope.media.length; i++) {
//                
//            }
            for(var attr in item) {
//                console.log('searchMedia item : '+item.name);
//                if (searchMatch(item[attr], $scope.query)) {
                if (
                    
                    searchMatch(item.name, $scope.query) ||
                    searchMatch(item.description, $scope.query) ||
                    searchMatch(item.tags, $scope.query) ||
                    searchMatch(item.duration, $scope.query) 
                
                   ) {
//                    console.log('searchMedia returning true');
                    return true;
                }
            }
//            console.log('searchMedia returning false');
            return false;
        });
//        console.log('searchMedia Called '+$scope.filteredMedia.length);
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentPage = 1;
        // now group by pages
//        $scope.groupToPages();
        $scope.figureOutMediaToDisplay();
    };

          // init the filtered items
    $scope.searchProducts = function () {
//        console.log('searchMedia, query : '+$scope.query);
        
        $scope.filteredProducts = $filter('filter')($rootScope.products, function (item) {
//            for (var i=0; i < $scope.media.length; i++) {
//                
//            }
            for(var attr in item) {
//                console.log('searchMedia item : '+item.name);
//                if (searchMatch(item[attr], $scope.query)) {
                if (
                    
                    searchMatch(item.name, $scope.query) ||
                    searchMatch(item.description, $scope.query) ||
                    searchMatch(item.tags, $scope.query)
//                    ||
//                    searchMatch(item.duration, $scope.query) 
                
                   ) {
                    return true;
                }
            }
            return false;
        });
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredProducts, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentProductsPage = 1;
        // now group by pages
//        $scope.groupToPages();
        $scope.figureOutProductsToDisplay();
    };

//    this.$inject = ['$scope','$filter'];

       // calculate page in place
    $scope.groupToPages = function () {
//        $scope.pages = [];
//        
//        if ($scope.filteredMedia) {
//            for (var i = 0; i < $scope.filteredMedia.length; i++) {
//                if (i % $scope.itemsPerPage === 0) {
//                    $scope.pages[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredMedia[i] ];
//                } else {
//                    $scope.pages[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredMedia[i]);
//                }
//            }
//        }
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

    // functions have been describe process the data for display
//    $scope.searchMedia();

    // change sorting order
    $scope.sort_by = function(newSortingOrder) {
        if ($scope.sortingOrder == newSortingOrder)
            $scope.reverse = !$scope.reverse;

        $scope.sortingOrder = newSortingOrder;

        // icon setup
        $('th i').each(function(){
            // icon reset
            $(this).removeClass().addClass('icon-sort');
        });
        if ($scope.reverse)
            $('th.'+new_sorting_order+' i').removeClass().addClass('icon-chevron-up');
        else
            $('th.'+new_sorting_order+' i').removeClass().addClass('icon-chevron-down');
    };

//    $scope.$watch("currentPage + numPerPage", function() {
    
//    $scope.$watch("currentPage", function() {
//        console.log("currentPage watch ...");
//        if ($scope.media && $scope.media.length > 0) {
//            var begin = (($scope.currentPage - 1) * $scope.numPerPage), 
//                end = begin + $scope.numPerPage;
//            $scope.filteredMedia = $scope.media.slice(begin, end);
//        }
//    });
    $scope.mediaPageChanged = function() {
        console.log("currentPage changed ...");
        if ($scope.media && $scope.media.length > 0) {
            var begin = (($scope.currentPage - 1) * $scope.numPerPage), 
                end = begin + $scope.numPerPage;
            $scope.filteredMedia = $scope.media.slice(begin, end);
        }
    }

    
    $scope.initMediaPaging = function() {
        $scope.getMedia();
        $scope.filteredMedia = $scope.media.slice(0, $scope.numPerPage);
    }
    
     $scope.eventClicked = function(calendarEvent) {
         
     }
//            on-event-times-changed="calendarEvent.startsAt = calendarNewEventStart; calendarEvent.endsAt = calendarNewEventEnd"
//            edit-event-html="'<i class=\'glyphicon glyphicon-pencil\'></i>'"
//            delete-event-html="'<i class=\'glyphicon glyphicon-remove\'></i>'"
    $scope.closeAndUpdateMedia = function() {
        $scope.closeThisDialog();
        $scope.updatedMedia();
    }        
    
    $scope.eventEdited = function(calendarEvent) {
        console.log('findSchedule to edit : '+calendarEvent.sid);
        var sid = calendarEvent.sid.split("-")[0];
        var url = '/dsn/findSchedule?id='+sid; 
        $http.get(url)
           .then(function(res){
              var schedule = res.data;                
                console.log('editSchedule to edit : '+schedule);
                $rootScope.layoutElement = schedule.layoutElement;
                $rootScope.currentSchedule = schedule;
                $rootScope.leType = schedule.leType;
                var modal = ngDialog.open({
                    template: '/templates/dsn/popups/scheduleEvent.html',
                    showClose: false,
                    controller: 'ScheduleDialogController',
                    className: 'ngdialog-theme-default ngdialog-theme-custom'
                });

                modal.closePromise.then(function(res) {
                    $scope.events = [];
                    $scope.getSchedules();
                    $scope.$broadcast('calendar.refreshView');
                });

            
        });
    }
    
    
//   template: '/templates/dsn/popups/event.html',

    
    $scope.openCropperDialog = function() {
            ngDialog.open({
            template: '/templates/dsn/popups/cropper.html',
            showClose: false,
            controller: 'ImageCropperCtrl',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    }
    $scope.openFilteredUpload = function() {
            ngDialog.open({
            template: '/templates/dsn/popups/filteredUpload.html',
            showClose: false,
            controller: 'FilteredUpload',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
    }
    $scope.eventDeleted = function(calendarEvent) {
        console.log('findSchedule to delete : '+calendarEvent.sid);
        var sid = calendarEvent.sid.split("-")[0];
        var url = '/dsn/removeSchedule?sid='+sid; 
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeSchedule returned response : '+response);
            $scope.getMedia();
            $scope.events = [];
            $scope.getSchedules();
            $scope.$broadcast('calendar.refreshView');
        });    
//        $scope.events = [];
//        $scope.getSchedules();
//        $scope.$broadcast('calendar.refreshView');
//        if ($scope.events.length > 0) {
//            for (var idx=$scope.events.length-1; idx >= 0; idx--)  {
//                var event = $scope.events[idx];
//                if (event.sid == sid) {
//                    $scope.events.splice(idx,1);
//                }
//            }
//        }
        
    }

    $scope.setCalendarView = function(v) {
        $scope.calendarView = v;
        $scope.$broadcast('calendar.refreshView');
    }
    
    $scope.setToday = function() {
        $scope.viewDate = new Date();
        $scope.$broadcast('calendar.refreshView');
    }
    
    $scope.prevCalendar = function() {
        switch ($scope.calendarView) {
            case 'day':
                $scope.viewDate = subDay($scope.viewDate,1);
                break;
            case 'week':
                $scope.viewDate = subWeek($scope.viewDate,1);
                break;
            case 'month':
                $scope.viewDate = subMonth($scope.viewDate,1);
                break;
            case 'year':
                $scope.viewDate = subYear($scope.viewDate,1);
                break;
        }
        $scope.calendarDay = $scope.viewDate;
        $scope.$broadcast('calendar.refreshView');
    }
    
    $scope.nextCalendar = function() {
        switch ($scope.calendarView) {
            case 'day':
                $scope.viewDate = addDay($scope.viewDate, 1);
                break;
            case 'week':
                $scope.viewDate = addWeek($scope.viewDate, 1);
                break;
            case 'month':
                $scope.viewDate = addMonth($scope.viewDate, 1);
                break;
            case 'year':
                $scope.viewDate = addYear($scope.viewDate, 1);
                break;
        }
        $scope.calendarDay = $scope.viewDate;
//        console.log('nextCalendar() : '+$scope.viewDate);
        $scope.$broadcast('calendar.refreshView');
//        refreshCalendar();
    }

    const SCHEDULE = 0;
    const WHEEL = 1;
    const LAYOUTS = 2;
    const TEMPLATES = 3;

    const GROUPS = 6;
    const PRODUCTS = 7;
    const ANNOUCEMENTS = 8;
    const COMPANIES = 9;
    const FEEDS = 10;

    const PRODUCTGROUPS = 11;
    const ANNOUNCEMENTGROUPS = 12;
    const COMPANYGROUPS = 13;
    const FEEDGROUPS = 14;

    var calActions = [{
        label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
        onClick: function(args) {
            console.log('Edit clicked '+args.calendarEvent);
            $scope.eventEdited(args.calendarEvent);
        }
    }, {
        label: '<i class=\'glyphicon glyphicon-remove\'></i>',
        onClick: function(args) {
            console.log('Delete clicked : '+args.calendarEvent);
            $scope.eventDeleted(args.calendarEvent);
        }
    }];

    
//    $scope.templates =
//       [ 
//        [{name: 'schedule.html', url: '/templates/dsn/schedule.html'}],
//        [{name: 'wheel.html', url: '/templates/dsn/wheel.html'}],
//        [{name: 'layouts.html', url: '/templates/dsn/layouts.html'}],
//        [{name: 'templates.html', url: '/templates/dsn/templates.html'}],
//        [{name: 'resolutions.html', url: '/templates/dsn/resolutions.html'}],
//        [{name: 'media.html', url: '/templates/dsn/media.html'}],
//        [{name: 'groups.html', url: '/templates/dsn/groups.html'}],
//
//        [{name: 'products.html', url: '/templates/dsn/products.html'},
//            {name: 'product.html', url: '/templates/dsn/product.html'},
//            {name: 'product.html', url: '/templates/dsn/product.html'}],
//
//        [ {name: 'announcements.html', url: '/templates/dsn/announcements.html'},
//            {name: 'announcement.html', url: '/templates/dsn/announcement.html'},
//            {name: 'announcement.html', url: '/templates/dsn/announcement.html'}],
//        [{name: 'feeds.html', url: '/templates/dsn/feeds.html'}],
//        [{name: 'rules.html', url: '/templates/dsn/rules.html'}],
////        {name: 'datasets.html', url: '/templates/dsn/datasets.html'},
//        [{name: 'displays.html', url: '/templates/dsn/displays.html'}],
//        [{name: 'dgroups.html', url: '/templates/dsn/dgroups.html'}],
//        [{name: 'statistics.html', url: '/templates/dsn/statistics.html'}],
//        [{name: 'settings.html', url: '/templates/dsn/settings.html'}],
//        [{name: 'rules.html', url: '/templates/dsn/rules.html'}]
//        ];
    
    var ms = ScopeMap.get('dsn.menuSelection');
    if (ms) {
        console.log('... ScopeMap found ms : '+JSON.stringify(ms));
        
        $scope.menuSelection = ms.screen;
        $scope.menuPage = ms.page;
    }
 
    var navigationGuardian = function() {
        console.log('storing menuSelection')
        ScopeMap.store('dsn.menuSelection', { screen : $scope.menuSelection, page : $scope.menuPage });
        return undefined;
    };
    
    saNavigationGuard.registerGuardian(navigationGuardian);
    


    // TODO : load events from api
    $scope.events = [
//        {
//        title: 'Signage Schedule', // The title of the event
//        type: 'info', // The type of the event (determines its color). Can be important, warning, info, inverse, success or special
//        startsAt: new Date(2013,5,1,1), // A javascript date object for when the event starts
//        endsAt: new Date(2014,8,26,15), // Optional - a javascript date object for when the event ends
//        editable: false, // If edit-event-html is set and this field is explicitly set to false then dont make it editable.
//        deletable: false, // If delete-event-html is set and this field is explicitly set to false then dont make it deleteable
//        draggable: true, //Allow an event to be dragged and dropped
//        resizable: true, //Allow an event to be resizable
//        incrementsBadgeTotal: true, //If set to false then will not count towards the badge total amount on the month and year view
//        recursOn: 'year', // If set the event will recur on the given period. Valid values are year or month
//        //A CSS class (or more, just separate with spaces) that will be added to the event when it is displayed 
//        // on each view. Useful for marking an event as selected / active etc
//        cssClass: 'a-css-class-name' 
//        }
    ];

    // TODO : change recurs to recurrence element in schedule
    $scope.getSchedules = function() {

       console.log('getting schedules...');
       var url = '/dsn/schedules?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
        
       $http.get(url)
//       $http.get('/dsn/schedules')
       .then(function(res){
           console.log('back from getting schedules : '+res.data.length);
           
           for (var i = 0; i < res.data.length; i++) {
              var startEventNumber = 0; 
              var schedule = res.data[i];
              if (schedule != null) {
                  var event = null;
                  var startDate = new Date(schedule.startsAt);
                  var endDate = new Date(schedule.endsAt);
                  if (schedule.recurrence && schedule.recurrence.enabled) {
                      
                      event = {};
//                      event.edit-event-html = "'<i class=\'glyphicon glyphicon-pencil\'></i>'";
//                      event.delete-event-html = "'<i class=\'glyphicon glyphicon-remove\'></i>'";
//                      event.on-edit-event-click = "eventEdited(calendarEvent)";
//                      event.on-delete-event-click = "eventDeleted(calendarEvent)";

                      event.title = schedule.title+"&nbsp;'<i class=\'glyphicon glyphicon-repeat\'></i>'";
//                      event.title ='Signage Schedule';
                      event.color = calendarConfig.colorTypes.important;
                      event.id = schedule.id;
                      event.sid = schedule.id;
                      event.startsAt = new Date(schedule.startsAt);
                      event.endsAt =   new Date(schedule.endsAt);
                      event.editable = true;
                      event.deletable = true;
                      event.draggable = false;
                      event.resizable = false;
                      event.schedule = schedule;
                      event.actions = calActions;
                      //cssClass: 'a-css-class-name' 
//                      console.log('pushing event...');
                      $scope.events.push(event);

                      
                      
                      
/*                      
                      var nextStartDate = new Date(schedule.startsAt);
                      var nextEndDate = new Date(schedule.endsAt);
//                      var startDate = new Date(schedule.startsAt);
//                      var recDetail = parseInt(schedule.recDetail);
                      var recDetail = 1;
                      var recursEndDate;
                      if (schedule.recRange) {
                          console.log('setting recursEndDate : '+res.data.length);
                          recursEndDate = new Date(schedule.recRange);
                          schedule.recRange = recursEndDate;
                      } else if (!recursEndDate) {
                          recursEndDate = new Date(schedule.endsAt);
                      }
//                      var startDate = new Date(nextStartDate.toDateString);
//                      console.log('nextStartDate : '+nextStartDate+' , startDate '+startDate+' recursOn : '+schedule.recursOn);
                      while (nextStartDate <= recursEndDate) {
//                          console.log('nextStartDate ('+nextStartDate+') is less than recursEndDate ('+recursEndDate+')');
                          switch (schedule.recurrence.type.toLowerCase()) {
                              case 'minute':
                                  // TODO : check this is valid ... i.e. not 1 or 2 minutes, but like 10 or 20 minutes or more
                                  nextStartDate = addMinute(nextStartDate, recDetail);
                                  break;
                              case 'hour':
                                  // TODO : check validity, what makes sense here.
                                  nextStartDate = addHour(nextStartDate, recDetail);
                                  break;
                              case 'day':
//                                  console.log('startDate '+startDate+' , nextStartDate+' +nextStartDate);
                                  nextStartDate = addDay(nextStartDate, recDetail);
                                  nextEndDate = addDay(nextEndDate, recDetail);
//                                  console.log('startDate '+startDate+' , nextStartDate+' +nextStartDate);
                                  break;
                              case 'week':
                                  nextStartDate = addWeek(nextStartDate, recDetail);
                                  nextEndDate = addWeek(nextEndDate, recDetail);
                                  break;
                              case 'month':
//                                  console.log('calling addMonth for nextStartDate : '+nextStartDate+' , '+recDetail);
                                  nextStartDate = addMonth(nextStartDate, recDetail);
                                  nextEndDate = addMonth(nextEndDate, recDetail);
//                                  console.log('addMonth returned : '+nextStartDate);
                                  break;
                              case 'year':
                                  nextStartDate = addYear(nextStartDate, recDetail);
                                  nextEndDate = addYear(nextEndDate, recDetail);
                                  break;
                          }
//                          if (nextStartDate > recursEndDate) {
//                              console.log('nextStartDate ('+nextStartDate+') is past recursEndDate ('+recursEndDate+')!')
//                              break;
//                          }
                          event = {};
                          event.title = schedule.title;
                          event.sid = schedule.id+'-'+startEventNumber;
                          // get the start time and do some offsetting
                          event.startsAt = startDate;
                          // get the end time and do some offsetting
//                          var endDate = ;
//                          var h = startDate.getHours();
//                          endDate.setHours(h+23);
                          
                          event.endsAt =   endDate;
                          event.editable = true;
                          event.deletable = true;
                          event.draggable = false;
                          event.resizable = false;
//                          event.on-event-click="eventClicked(calendarEvent)"
//                          event.on-event-times-changed="calendarEvent.startsAt = calendarNewEventStart; calendarEvent.endsAt = calendarNewEventEnd"
//                          event.edit-event-html="'<i class=\'glyphicon glyphicon-pencil\'></i>'"
//                          event.delete-event-html="'<i class=\'glyphicon glyphicon-remove\'></i>'"
//                          event.on-edit-event-click="eventEdited(calendarEvent)"
//                          event.on-delete-event-click="eventDeleted(calendarEvent)"
                          
                          
//                          console.log('pushing event...');
                          $scope.events.push(event);
//                          console.log('added event: '+event.sid+' , startDate : '+startDate+' , endDate : '+endDate);
                          startEventNumber++;
                          startDate = new Date(nextStartDate.toDateString());
                          endDate = new Date(nextEndDate.toDateString());
                      }
                      
*/                      
                  } else {
                      event = {};
//                      event.title = schedule.title;
                      event.title = schedule.title+"&nbsp;'<i class=\'glyphicon glyphicon-list\'></i>'"

//                      event.title ='Signage Schedule';
//                      event.edit-event-html = "'<i class=\'glyphicon glyphicon-pencil\'></i>'";
//                      event.delete-event-html = "'<i class=\'glyphicon glyphicon-remove\'></i>'";
//                      event.on-edit-event-click = "eventEdited(calendarEvent)";
//                      event.on-delete-event-click = "eventDeleted(calendarEvent)";
                      
                      event.id = schedule.id;
                      event.sid = schedule.id;
                      event.startsAt = new Date(schedule.startsAt);
                      event.endsAt =   new Date(schedule.endsAt);
                      event.color = calendarConfig.colorTypes.info;
//                      event.editable = true;
//                      event.deletable = true;
                      event.draggable = false;
                      event.resizable = false;
                      event.schedule = schedule;
                      event.actions = calActions;

                      //cssClass: 'a-css-class-name' 
//                      console.log('pushing event...');
                      $scope.events.push(event);
                  }
                  console.log('added a schedule to events : '+schedule.id);
//                  console.log('events : '+$scope.events.length);
//                  for (var idx=0; idx < $scope.events.length; idx++) {
//                      var ev = $scope.events[idx];
//                      console.log('event: '+ev.title+' , startDate : '+ev.startsAt+' , endDate : '+ev.endsAt);
//                  }
                  
              }  
           }
        });
    };

    
   $scope.processFiles = function (files) {
//        angular.forEach(files, function (flowFile, i) {
//            console.log('processFiles : '+JSON.stringify(flowFile));
//            $scope.images[i]={};
//            var fileReader = new FileReader();
//            var image = new Image();
//            fileReader.onload = function (event) {
//                var uri = event.target.result;
//                image.src = uri;
//                image.onload = function(){
//                    $scope.images[i].width = this.width;
//                    $scope.images[i].height = this.height;
//                    // update scope to display dimension 
//                    $scope.$apply();
//                };
//                $scope.images[i].uri = uri;
//            };
//            fileReader.readAsDataURL(flowFile.file);
//        });
    };

    
    $scope.$watch('file', function() {
        console.log('watch file triggered!');
        var file = $scope.file;
        if (!file) {
          return;
        }
        
        fr.onload = function() {
            var img = new Image;
        
            img.onload = function() { 
//I loaded the image and have complete control over all attributes, like width and src, which is the purpose of filereader.
                $.ajax({url: img.src, async: false, success: function(result){
            		$("#result").html("READING IMAGE, PLEASE WAIT...")
            		$("#result").html("<img src='" + img.src + "' />");
                    
                    console.log('Finished reading Image , width :  '+img.width+' , height : '+img.height);
                     Upload.upload({
                          url: '/dsn/upload',
                          network: encodeURIComponent($rootScope.selectedNetwork.id),
                          file: file
                    }).progress(function(evt) {
                          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                          console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function(data, status, headers, config) {
                          console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                          $scope.media.push(data);
                    }).error(function(data, status, headers, config) {
                          console.log('error status: ' + status);
                    })    
                        
        		}});
            };
        
            img.src = fr.result;
        };
    
        fr.readAsDataURL(this.files[0]);
        
        
        
//        Upload.upload({
//          url: '/dsn/upload',
//          network: $rootScope.selectedNetwork.id,
//          file: file
//        }).progress(function(evt) {
//          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
//          console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
//        }).success(function(data, status, headers, config) {
//          console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
//          $scope.media.push(data);
//        }).error(function(data, status, headers, config) {
//          console.log('error status: ' + status);
//        })
    });;

    $scope.assignImage = function () {
        // TODO : really for product, needs to be refactored
        console.log('assignImage, name : '+$rootScope.selectedAsset.name);
        $rootScope.currentProduct[$scope.imageName].path = $rootScope.selectedAsset.path;
        $rootScope.currentProduct[$scope.imageName].id = $rootScope.selectedAsset.id;
        $rootScope.currentProduct[$scope.imageName].size = $rootScope.selectedAsset.size;
        $rootScope.currentProduct[$scope.imageName].width = $rootScope.selectedAsset.width;
        $rootScope.currentProduct[$scope.imageName].height = $rootScope.selectedAsset.height;
        $rootScope.companyInfoDirty = true;
        $rootScope.imageName = '';
        $rootScope.selectedAsset = '';
        $rootScope.selectedImage = '';
        console.log('assignImage : companyInfo : '+JSON.stringify($rootScope.currentProduct));
        $scope.closeThisDialog();
    };

    $scope.resetImage = function(name) {
        // TODO : really for product, needs to be refactored
        CService.resetImage(name);
        $scope.closeThisDialog();
    }

    $scope.removeMedia = function(asset) {
        console.log('removing media , asset : '+asset);
        var url = '/dsn/removeMedia?mid='+asset._id; 
        $http({
            url: url,
            method: "POST",
            data: null,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeMedia returned response : '+response);
            $scope.getMedia();
        });    
    }
    $scope.removeWheel = function(id) {
        var url = '/dsn/removeWheel?wid='+id; 
        $http({
            url: url,
            method: "POST",
            data: null,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeWheel returned response : '+JSON.stringify(response));
            $scope.getWheels();
        });    
    }
    $scope.removeLayout = function(id) {
        var url = '/dsn/removeLayout?lid='+id; 
        $http({
            url: url,
            method: "POST",
            data: null,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeLayout returned response : '+JSON.stringify(response));
            $scope.getLayouts();
        });    
    }
    $scope.uploadSingle = function () {
      // do something with the file
      alert($scope.file.name);
    };
    
    $scope.uploadMulti = function () {
      // do something with the files
      angular.forEach($scope.files, function (file) {
        alert(file.size);
      });
    };

    $rootScope.media=[];
//	$http.get("http://localhost:1337/campaign/content")
//		 .success(function(data){
//		 	$rootScope.media=data;
//		 	console.log("read media from sails : "+$scope.media);
//     });
    console.log('loading template : menu : '+$scope.menuSelection+' , page : '+$scope.menuPage);
//    $scope.template = $scope.templates[$scope.menuSelection][$scope.menuPage];
    $scope.initAnnouncement = function() {
        if (!$rootScope.currentAnnouncement) {
            $rootScope.currentAnnouncement = {
                chimage: {
                 src: '/images/320x240.png'
                },
                cinfo: 'Enter your Announcement Title here.'
            };
        }
    }
    $scope.view = {
        setView: function() {
            var ms = ScopeMap.get('dsn.menuSelection');
            if (ms) {
                console.log("DSNController.init() setting menuSelection to : "+ms);
                $scope.menuSelection = ms.screen;
                $scope.menuPage = ms.page;
                $scope.loaded = true;
            }
//            var ms = ScopeMap.store('dsn.menuSelection', {screen : $scope.menuSelection, page: $scope.menuPage});
//            if (ms) {
//                    console.log('setView found ms '+JSON.stringify(ms));
//                    $scope.menuSelection = ms.screen;
//                    $scope.menuPage = ms.page;
//            }
            console.log('DSN setView calling setTemplate() : '+$scope.menuSelection+' , '+$scope.menuPage);
            $scope.setTemplate();
            return $scope.template.url;
        },
        getView: function(v) {
                $scope.menuSelection = v;
                console.log('DSN getView calling setTemplate() : '+$scope.menuSelection+' , '+$scope.menuPage);
                //$scope.setTemplate();
                ScopeMap.store('dsn.menuSelection', {screen : $scope.menuSelection, page: $scope.menuPage});
//                console.log('DSN getView returning '+JSON.stringify($scope.template));
//                return $scope.template.url;
        },
        gView: function(v, p) {
            var url = '';
            var template = TSvc.gTemplate(MARKETABILITY, v, p);
            console.log('gView returned '+template);
            if (template) {
                $scope.template = template;
//                
//                url = template.url;
                $scope.menuSelection = v;
                $scope.menuPage = p;
                $scope.view.setView();
                console.log('DSN gView returning '+$scope.template.url);
//                ScopeMap.store('dsn.menuSelection', {screen : $scope.menuSelection, page: $scope.menuPage});
            }
            return url;
        }
    };
    $scope.setTemplate = function() {
        if (!$scope.menuSelection) {
            $scope.menuSelection = 0;
        }
        var tList = $rootScope.mTemplates[MARKETABILITY][$scope.menuSelection];
        if (!$scope.menuPage || $scope.menuPage >= tList.length) {
            $scope.menuPage = 0;
        }
        if ($scope.menuPage >= tList.length) {
            $scope.menuPage = 0;
        }
        $scope.template = tList[$scope.menuPage];
        console.log('DSNController.setTemplate : '+JSON.stringify($scope.template));
    }
    $scope.setTemplate();
    $scope.$on('$viewContentLoaded', function(){
        console.log('DSNController.$viewContentLoaded');
       // initComponents();
    });
    
    $scope.childOnLoad = function() {
            console.log('DSNController.childOnLoad');
//            initComponents();
    };
    
    $scope.getLayoutCount = function(wheel) {
        var lc = 0;
        if (wheel != null && wheel.layouts != null) {
            lc = wheel.layouts.length;
        }
        return lc;
    }
    $scope.media = {
       name : 'Name',
       fname : 'fname',
       title : 'Title',
       discount : 'Discount',
       description : 'Description',
       pcode : '/images/data/Product_1.png',
       cimg : '/images/data/couponImages/101161487_KTG.png'
    };
    $scope.openScheduleDialogForWheel = function (le) {
        console.log("openScheduleDialog");
        $rootScope.layoutElement = le;
        if (!$rootScope.currentSchedule) {
            $rootScope.currentSchedule = {};
        }    
        $rootScope.leType = 'wheel';
        ngDialog.open({
            template: '/templates/dsn/popups/scheduleEvent.html',
            showClose: false,
            controller: 'ScheduleDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
//            template: '/templates/dsn/popups/event.html',
    $scope.openScheduleDialogForLayout = function (le) {
        console.log("openScheduleDialog");
        $rootScope.layoutElement = le;
        if (!$rootScope.currentSchedule) {
            $rootScope.currentSchedule = {};
        }    
        $rootScope.leType = 'layout';
        ngDialog.open({
            template: '/templates/dsn/popups/scheduleEvent.html',
            showClose: false,
            controller: 'ScheduleDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom ngdialog-schedule'
        });
        //FileUploadCtrl($scope);

    };
//            template: '/templates/dsn/popups/event.html',
    $scope.duplicateWheel = function (le) {
        console.log("duplicateWheel");
        var newObj = $.extend(true, {}, le);
        // clear the id field
        newObj.id = null;
//        newObj.name = newObj.name.split('()')[0]+'(2)';
        newObj.name = newObj.name +'(2)';
        newObj.currentWheel.assetType = 'Wheel';
        newObj.network = encodeURIComponent($rootScope.selectedNetwork.id);
        console.log('duplicating wheel : '+le);
        var url = '/dsn/saveWheel'; 
        $http({
            url: url,
            method: "POST",
            data: newObj,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('currentWheel returned response : '+response);
            $scope.getWheels();
            // refresh layouts on page
//                $scope.getLayouts();
        });    
    };
    $scope.showRepeats = function () {
        console.log("recursOn : "+$scope.recursOn);
    };

    $scope.repeatsSet = function () {
        if ($scope.recursOn && $scope.recursOn != "") {
            console.log("recursOn returning true.");
            return "display: none;";
        }
        console.log("repeatsSet returning false.");
        return "display: block;";
    };
    $scope.openUploadDialog = function () {
        console.log("openUploadDialog");
        ngDialog.open({
            template: 'uploadDialog',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.openAddMediaDialog = function () {
        console.log("openAddMediaDialog");
        ngDialog.open({
            template: '/templates/dsn/popups/mediaTemplate.html',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.openLocationDialog = function () {
        console.log("openLocationDialog");
        ngDialog.open({
            template: '/templates/dsn/popups/locationTemplate3.html',
            showClose: false,
            controller: 'MapController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.openAddRuleDialog = function () {
        console.log("openAddRuleDialog");
        $rootScope.currentRule = {};
        ngDialog.open({
            template: '/templates/dsn/popups/ruleTemplate.html',
            showClose: false,
            controller: 'RuleEditDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
    };
    $scope.openEditRuleDialog = function (cr) {
        console.log("openAddRuleDialog");
        $rootScope.currentRule = cr;
        ngDialog.open({
            template: '/templates/dsn/popups/ruleTemplate.html',
            showClose: false,
            controller: 'RuleEditDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
    };
    // this needs to work for displays and displaygroups ( or split it out ... )
    $scope.getDefaultLayoutInfo = function(display) {
        var layoutName = "";
        console.log('getDefaultLayoutInfo ... ');
        if (display && display.defaultLayout) {
            var id = display.defaultLayout;
            var li;
            if (display.defaultLayoutType == 'wheel') {
                li = oForID($rootScope.wheels, id);
                console.log('oForID returned : '+li);
                if (li) {
                    layoutName = li.name;
                }
            } else {
                li = oForID($rootScope.layouts, id);
                console.log('oForID returned : '+li);
                if (li) {
                    layoutName = li.name;
                }
            }
        }
        return layoutName;
    }
    
    $scope.openEditDisplayDialog = function (display) {
        console.log("openEditDisplayDialog");
        $rootScope.currentDisplay = display;
        ngDialog.open({
            template: '/templates/dsn/popups/display.html',
            showClose: false,
            controller: 'DisplayDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };

    $scope.openAddDisplayDialog = function () {
        console.log("openAddDisplayDialog");
        ngDialog.open({
            template: '/templates/dsn/popups/display.html',
            showClose: false,
            controller: 'DisplayDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.openAddDisplayGroupDialog = function (dg) {
        $rootScope.dialogTitle = 'Add Display Group';
        if (dg) {
            $rootScope.currentDisplayGroup = dg;
            $rootScope.dialogTitle = 'Edit Display Group';
        }
        console.log("openAddDisplayGroupDialog");
        ngDialog.open({
            template: '/templates/dsn/popups/displayGroupTemplate.html',
            showClose: false,
            controller: 'DGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.getDisplayCount = function (dg) {
        var dc = 0;
        if (dg && dg.displays) {
            dc = dg.displays.length;
        }
        return dc;
    };
    $scope.openAssignDisplayGroupDialog = function (dg) {
        if (dg) {
            console.log("openAssignDisplayGroupDialog : "+JSON.stringify(dg));
            $rootScope.currentDisplayGroup = dg;
        }
        console.log("openAssignDisplayGroupDialog");
        ngDialog.open({
            template: '/templates/dsn/popups/assignPlayerForm.html',
            showClose: false,
            controller: 'DGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.openAddRuleToMediaDialog = function (media) {
        console.log("openEditMediaDialog : "+media);
        $rootScope.currentMedia = media;
        ngDialog.open({
            template: '/templates/dsn/popups/addRuleToMediaTemplate.html',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
    };

    $scope.openEditMediaDialog = function (media) {
        console.log("openEditMediaDialog : "+media);
        $rootScope.currentMedia = media;
        if (!$rootScope.currentMedia.duration) {
            $rootScope.currentMedia.duration = GS.defaultDuration;
        }
        if (media.mimetype == 'text/html') {
            ngDialog.open({
                template: '/templates/dsn/popups/webpageTemplate.html',
                showClose: false,
                controller: 'DSNController',
                className: 'ngdialog-theme-default ngdialog-theme-custom'
            });
        } else {
            ngDialog.open({
                template: '/templates/dsn/popups/editMediaForm.html',
                showClose: false,
                controller: 'MediaDialogController',
                className: 'ngdialog-theme-default ngdialog-theme-custom'
            });
        }
        //FileUploadCtrl($scope);

    };
    $scope.openAddWebPageDialog = function () {
        console.log("openAddWebPageDialog");
        $rootScope.currentMedia = {};
        $rootScope.currentMedia.duration = GS.defaultDuration;

        ngDialog.open({
            template: '/templates/dsn/popups/webpageTemplate.html',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.openAddLayoutDialog = function () {
        console.log("openAddLayoutDialog");
        $rootScope.currentLayout = {};
        ngDialog.open({
            template: '/templates/dsn/popups/layoutTemplate.html',
            showClose: false,
            controller: 'LayoutEditDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
        });

    };
    $scope.openAddWheelDialog = function () {
        console.log("openAddWheelDialog");
//        $rootScope.currentWheel = {};
        ngDialog.open({
            template: '/templates/dsn/popups/associateLayoutTemplate.html',
            showClose: false,
            controller: 'WheelDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
        });

    };
    $scope.openEditWheelDialog = function (wheel) {
        console.log("openEditWheelDialog");
        $rootScope.currentWheel = wheel;
        
        
        ngDialog.open({
            template: '/templates/dsn/popups/associateLayoutTemplate.html',
            showClose: false,
            controller: 'WheelDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
        });

    };
    // assign media to layouts
    $scope.openAssignContentDialog = function (layout) {
        console.log("openAssignContentDialog for layout : "+layout);
        $rootScope.currentLayout = layout;
        ngDialog.open({
            template: '/templates/dsn/popups/assignContentTemplate.html',
            showClose: false,
            controller: 'LayoutAssignDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
        });
        //FileUploadCtrl($scope);

    };
    $scope.openAssociateLayoutDialog = function (wheel) {
        console.log("openAssociateLayoutDialog");
        $rootScope.currentWheel = wheel;
        ngDialog.open({
            template: '/templates/dsn/popups/associateLayoutTemplate.html',
            showClose: false,
            controller: 'WheelDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
        });
        //FileUploadCtrl($scope);

    }
    
    $scope.openEditLayoutDialog = function (layout) {
        
        $rootScope.currentLayout = layout;
        $scope.layoutTitle = 'Edit Layout';
        console.log("openEditLayoutDialog for : "+layout.id);
        ngDialog.open({
            template: '/templates/dsn/popups/layoutTemplate.html',
            showClose: false,
            controller: 'LayoutEditDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope
        });
    }

    
    $scope.createProductGroup = function() {
        $rootScope.currentProductGroup = {};
        $rootScope.currentProductGroup.id = '';
        $rootScope.currentProductGroup.info ='';
        $rootScope.currentProductGroup.name ='';
        $rootScope.currentProductGroup.category ='';
        $rootScope.currentProductGroup.description ='';
        $rootScope.currentProductGroup.details ='';
        console.log('createProductGroup : currentProductGroup : '+JSON.stringify($rootScope.currentProductGroup));
    }

    
    $scope.createProduct = function() {
        $rootScope.currentProduct = {};
        $rootScope.currentProduct.id = '';
        $rootScope.currentProduct.info ='';
        $rootScope.currentProduct.description ='';
        
//        $rootScope.currentProduct.logo = {path:'/images/companyLogo.png',width:'',height:''};
        $rootScope.currentProduct.mapImage = {path:'/images/companyImage.png',width:'',height:''};
        $rootScope.currentProduct.image= {path:'/images/1920x1080.png',width:'',height:''};
//        $rootScope.currentProduct.bgimage= {path:'/images/background.png',width:'',height:''};
        console.log('createProduct : currentProduct : '+JSON.stringify($rootScope.currentProduct));
    }

    $scope.validateProduct = function() {
        
//        $rootScope.currentProduct.logo = {src:'/images/companyLogo.png',width:'',height:''};
        if (!$rootScope.currentProduct.mapImage) {
            $rootScope.currentProduct.mapImage = {path:'/images/companyImage.png',width:'',height:''};
        }
        if (!$rootScope.currentProduct.image) {
            $rootScope.currentProduct.image= {path:'/images/1920x1080.png',width:'',height:''};
        }
//        $rootScope.currentProduct.bgimage= {src:'/images/background.png',width:'',height:''};
        console.log('createProduct : currentProduct : '+JSON.stringify($rootScope.currentProduct));
    }

    $scope.createCompany = function() {
        $rootScope.currentCompany = {};
        $rootScope.currentCompany.id = '';
        $rootScope.currentCompany.info ='';
        $rootScope.currentCompany.description ='';
        
//        $rootScope.currentProduct.logo = {path:'/images/companyLogo.png',width:'',height:''};
        $rootScope.currentCompany.mapImage = {path:'/images/companyImage.png',width:'',height:''};
        $rootScope.currentCompany.image= {path:'/images/1920x1080.png',width:'',height:''};
//        $rootScope.currentProduct.bgimage= {path:'/images/background.png',width:'',height:''};
        console.log('createProduct : currentProduct : '+JSON.stringify($rootScope.currentCompany));
    }

    $scope.openAddCompany = function () {
        $scope.productPageTitle = 'Create Company';
        $scope.createCompany();
        $scope.menuPage = CREATE;
        $scope.view.getView(COMPANIES);
        $scope.view.setView();
//        console.log("openAddProductDialog");
//        ngDialog.open({
//            template: '/templates/dsn/popups/productTemplate.html',
//            showClose: false,
//            controller: 'DisplayDialogController',
//            className: 'ngdialog-theme-default ngdialog-theme-custom'
//        });
        //FileUploadCtrl($scope);

    };

    $scope.openAddProduct = function () {
        $scope.productPageTitle = 'Create Product';
        $scope.createProduct();
        $scope.menuPage = CREATE;
        $scope.view.getView(PRODUCTS);
        $scope.view.setView();
//        console.log("openAddProductDialog");
//        ngDialog.open({
//            template: '/templates/dsn/popups/productTemplate.html',
//            showClose: false,
//            controller: 'DisplayDialogController',
//            className: 'ngdialog-theme-default ngdialog-theme-custom'
//        });
        //FileUploadCtrl($scope);

    };

    $scope.editProduct = function (product) {
        console.log('editProduct for product : '+JSON.stringify(product));
        $scope.productPageTitle = 'Edit Product';

        $rootScope.currentProduct = product;
        $scope.validateProduct();
        $scope.menuPage = CREATE;
        $scope.view.getView(PRODUCTS);
        $scope.view.setView();
        console.log("openEditProductDialog");
//        ngDialog.open({
//            template: '/templates/dsn/popups/editProductTemplate.html',
//            showClose: false,
//            controller: 'ProductDialogController',
//            className: 'ngdialog-theme-default ngdialog-theme-custom'
//        });
        //FileUploadCtrl($scope);

    };

    $scope.openLocateProduct = function () {
//        console.log('openLocateProduct');
//        $scope.showMap = true;
//        $scope.view.gView(PRODUCTS, LOCATE);
//        $scope.menuPage = LOCATE;
//        var url = $scope.view.getView(PRODUCTS);
//         $location.url(url);
//        $scope.view.setView();
//        console.log("openAddProductDialog");
        ngDialog.open({
            template: '/templates/dsn/plocate2.html',
            showClose: false,
            controller: 'MapController',
            className: 'ngdialog-theme-plain custom-height'
//            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };

    $scope.openLocateProduct2 = function (image, width, height, min) {
        console.log('openLocateProduct2 - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        $rootScope.selectedImage = $scope.getProductImage();
        
        ngDialog.open({
            template: '/templates/dsn/plocate2.html',
            showClose: false,
            controller: 'MapController',
            className: 'ngdialog-theme-plain custom-height'
//            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };

    $scope.openLocateProductGroup = function (image, width, height, min) {
        console.log('openLocateProductGroup - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        
        var modal = ngDialog.open({
            template: '/templates/dsn/plocate2.html',
            showClose: false,
            controller: 'MapController',
            className: 'ngdialog-theme-plain custom-height'
        });

        modal.closePromise.then(function(res) {
             
             if (res) {
                 var location = res.value;
                 $rootScope.currentProductGroup.location = location;
                 console.log('locateProductGroup close result : '+JSON.stringify(location));
             }
         });

        
    };

    $scope.openLocateAnnouncementGroup = function (image, width, height, min) {
        console.log('openLocateAnnouncementGroup - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        
        var modal = ngDialog.open({
            template: '/templates/dsn/plocate2.html',
            showClose: false,
            controller: 'MapController',
            className: 'ngdialog-theme-plain custom-height'
        });

        modal.closePromise.then(function(res) {
             
             if (res) {
                 var location = res.value;
                 $rootScope.currentAnnouncementGroup.location = location;
                 console.log('locateProductGroup close result : '+JSON.stringify(location));
             }
         });

        
    };

    $scope.openEditProduct = function (product) {
        console.log("openEditProduct : "+product);
        $rootScope.currentProduct = product;
        $scope.menuPage = EDIT;
        $scope.view.getView(PRODUCTS);
//        ngDialog.open({
//            template: '/templates/dsn/popups/productTemplate.html',
//            showClose: false,
//            controller: 'DSNController',
//            className: 'ngdialog-theme-default ngdialog-theme-custom'
//        });

    };

    $scope.openAddFeed = function () {
        console.log("openAddFeed : ");
        ngDialog.open({
            template: '/templates/dsn/popups/feedTemplate.html',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    
    $scope.openEditFeed = function (feed) {
        console.log("openEditFeed : "+feed);
        $rootScope.currentFeed = feed;
        ngDialog.open({
            template: '/templates/dsn/popups/feedTemplate.html',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    $scope.openAddAnnouncement = function () {
        $scope.menuPage = CREATE;
        $scope.view.getView(ANNOUCEMENTS);
//        console.log("openEditAnnouncement : ");
//        ngDialog.open({
//            template: '/templates/dsn/popups/announcementTemplate.html',
//            showClose: false,
//            controller: 'DSNController',
//            className: 'ngdialog-theme-default ngdialog-theme-custom'
//        });

    };

    $scope.showAnnouncements = function () {
//        $scope.menuPage = LIST;
        $scope.view.gView(ANNOUCEMENTS,LIST);
    };

    $scope.showProducts = function () {
        $scope.menuPage = LIST;
        $scope.view.getView(PRODUCTS);
    };

    $scope.showProductGroups = function () {
        console.log("showProductGroups()");
//        $scope.view.gView(GROUPS,LIST);
        $scope.groupView.name = 'company';
        $scope.menuPage = CREATE;
        $scope.view.getView(GROUPS);
    };

    $scope.showCompanyGroups = function () {
        console.log("showProductGroups()");
//        $scope.view.gView(GROUPS,LIST);
        $scope.groupView.name = 'product';
        $scope.menuPage = CREATE;
        $scope.view.getView(COMPANYGROUPS);
    };

    $scope.showAnnouncementGroups = function () {
        console.log("showAnnouncementGroups()");
        $scope.groupView.name = 'announcements';
        $scope.menuPage = CREATE;
        $scope.view.getView(GROUPS);
    };

    $scope.showFeedGroups = function () {
        console.log("showFeedGroups()");
        $scope.groupView.name = 'feed';
        $scope.menuPage = CREATE;
        $scope.view.getView(GROUPS);
    };

    $scope.openEditAnnouncement = function (announcement) {
        console.log("openEditAnnouncement : "+announcement);
        $rootScope.currentAnnouncement = announcement;
        ngDialog.open({
            template: '/templates/dsn/popups/announcementTemplate.html',
            showClose: false,
            controller: 'DSNController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    $scope.importProducts = function () {
        console.log("importProducts called");
        ngDialog.open({
            template: '/templates/dsn/popups/productImportTemplate.html',
            showClose: false,
            controller: 'CSVImportController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };


    // content groups
    
    $scope.openAddProductGroup = function () {
        console.log("openAddProductDialog");
        ngDialog.open({
            template: '/templates/dsn/popups/productGroupTemplate.html',
            showClose: false,
            controller: 'ProductGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };

    
    $scope.openEditProductGroup = function (productGroup) {
        console.log("openEditProduct : "+product);
        $rootScope.currentProduct = product;
        ngDialog.open({
            template: '/templates/dsn/popups/productGroupTemplate.html',
            showClose: false,
            controller: 'ProductGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    $scope.openAddFeedGroup = function () {
        console.log("openAddFeed : ");
        ngDialog.open({
            template: '/templates/dsn/popups/feedGroupTemplate.html',
            showClose: false,
            controller: 'FeedGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    
    $scope.openEditFeedGroup = function (feedGroup) {
        console.log("openEditFeed : "+feed);
        $rootScope.currentFeed = feed;
        ngDialog.open({
            template: '/templates/dsn/popups/feedGroupTemplate.html',
            showClose: false,
            controller: 'FeedGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    $scope.openAddAnnouncementGroup = function () {
        console.log("openEditAnnouncement : ");
        ngDialog.open({
            template: '/templates/dsn/popups/announcementGroupTemplate.html',
            showClose: false,
            controller: 'AnnouncementGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    $scope.openEditAnnouncementGroup = function (announcementGroup) {
        console.log("openEditAnnouncement : "+announcement);
        $rootScope.currentAnnouncement = announcement;
        ngDialog.open({
            template: '/templates/dsn/popups/announcementGroupTemplate.html',
            showClose: false,
            controller: 'AnnouncementGroupDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });

    };

    $scope.getDisplayGroups = function() {
       var url = '/dsn/displayGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       $http.get(url)
       .then(function(res){
          $scope.displaygroups = res.data;                
          console.log('getLayouts found : '+$scope.displaygroups.length);
        });
    }
    
    $scope.getRuleTemplates = function() {
       $http.get('/templates/RuleTemplates.json')
           .then(function(res){
              $scope.ruleTemplates = res.data;                
              console.log('getRuleTemplates found : '+$scope.ruleTemplates.length);
        });
    }

    $scope.getLayoutTemplates = function() {
       $http.get('/templates/LayoutTemplates2.json')
       .then(function(res){
          $scope.layoutTemplates = res.data;                
          console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
        });
    }
    
    $scope.getLayouts = function() {
       var url = '/dsn/layouts?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       $http.get(url)
       .then(function(res){
          $rootScope.layouts = res.data;                
          console.log('getLayouts found : '+$rootScope.layouts.length);
        });
    }
    
    $scope.getDisplays = function() {
       var url = '/dsn/displays?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       $http.get(url)
       .then(function(res){
          $scope.displays = res.data;                
          console.log('getDisplays found : '+$scope.displays.length);
        });
    }
    
    $scope.assignContentToGroup = function(dg) {
        
    }

    $scope.assignContentToDisplay = function(display) {
        
    }

    $scope.getWheels = function() {
       var url = '/dsn/wheels?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
       $http.get(url)
       .then(function(res){
          $rootScope.wheels = res.data;                
          console.log('getWheels found : '+$rootScope.wheels.length);
        });
    }
    
    $scope.findLayoutForMedia = function(asset, cb) {
        var url = '/dsn/layoutWithMedia?id='+asset._id; 
        $http.get(url)
           .then(function(res){
              var layouts = res.data;
              cb(layouts);
              console.log('findLayoutForMedia found : '+layouts.length);
//              $scope.searchResults = res.data;                
//              console.log('findLayoutForMedia found : '+$scope.searchResults.length);
        });
    }
    $scope.findScheduleForLayout = function(lid, cb) {
        var url = '/dsn/scheduleWithLayout?id='+lid; 
        $http.get(url)
           .then(function(res){
              var schedules = res.data;
              cb(schedules);
              console.log('findScheduleForLayout found : '+schedules.length);
//              $scope.searchResults = res.data;                
        });
    }
    $scope.deleteWheel = function(wid) {
        var url = '/dsn/removeWheel?wid='+wid; 
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeWheel returned response : '+response);
            $scope.removeWheelFromSchedule(wid);
            $scope.getWheels();
        });    
    }
    
    $scope.removeWheelFromSchedule = function(wid) {
        // TODO : search schedules and update 
    }

    $scope.deleteLayout = function(lid) {
        var url = '/dsn/removeLayout?lid='+lid; 
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeLayout returned response : '+response);
            $scope.removeLayoutFromWheel(lid);
            $scope.removeLayoutFromSchedule(lid);
            $scope.getLayouts();
        });    
    }
    
    $scope.removeLayoutFromWheel = function(lid) {
        // TODO : search schedules and update schedules if this media is present
    }
    $scope.removeLayoutFromSchedule = function(lid) {
        // TODO : search wheels and find update them
    }

    $scope.deleteMedia = function(mid) {
        var url = '/dsn/removeMedia?mid='+mid; 
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeMedia returned response : '+response);
            $scope.removeMediaFromSchedule(mid);
            $scope.removeMediaFromWheel(mid);
            $scope.removeMediaFromLayout(mid);
            $scope.getMedia();
        });    
    }

    $scope.removeMediaFromSchedule = function(mid) {
        // TODO : search schedules and update schedules if this media is present
    }
    $scope.removeMediaFromWheel = function(mid) {
        // TODO : search wheels and find update them
    }
    $scope.removeMediaFromLayout = function(mid) {
        // TODO : search layouts update them 
    }

    
    $scope.deleteDisplay = function(did) {
        var url = '/dsn/removeDisplay?did='+did; 
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeDisplay returned response : '+response);
            $scope.removeDisplayFromSchedule(did);
            $scope.removeFromGroup(did);
            $scope.getDisplays();
        });    
    }
    $scope.deleteDisplayGroup = function(gid) {
        var url = '/dsn/removeGroup?gid='+gid; 
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('removeDisplay returned response : '+response);
            $scope.removeDisplayFromSchedule(gid);
            $scope.getDisplayGroups();
        });    
    }
    $scope.removeDisplayFromSchedule = function(did) {
        // TODO : search schedule and find out if this display id ( or group id )
        // is in schedule
    }
    
    $scope.removeFromGroup = function(did) {
        // TODO : search group and update if this display id is present
    }
    $scope.removeDisplay = function(did) {
        $scope.removeDisplayFromSchedule(did);
        $scope.deleteDisplay(did);
    }
    $scope.setFiles = function(element) {
        $scope.$apply(function(scope) {
//            console.log('scope setFiles : '+JSON.stringify(element.files));
            // Turn the FileList object into an Array
//            $rootScope.files = element.files;
            $rootScope.files = [];
            for (var i = 0; i < element.files.length; i++) {
              var file = element.files[i];
              console.log("setFiles, file : "+file);
              $rootScope.files.push(file)
            }
            $scope.progressVisible = false
        });
    };
    $scope.saveProduct = function() {
        
//        $rootScope.currentProduct.info ='';
//        $rootScope.currentProduct.logo = {src:'/images/companyLogo.png',width:'',height:''};
//        $rootScope.currentProduct.cimage = {src:'/images/companyImage.png',width:'',height:''};
//        $rootScope.currentProduct.image= {src:'/images/1920x1080.png',width:'',height:''};
//        $rootScope.currentProduct.bgimage= {src:'/images/background.png',width:'',height:''};
        
        console.log('saving product : '+$rootScope.currentProduct);
        var url = '/dsn/saveProduct'; 
        if ($rootScope.currentProduct.id) {
            url+='?pid='+$rootScope.currentProduct.id;
        }
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentProduct,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveProduct returned response : '+response);
            // refresh layouts on page
            $scope.getProducts();
        });    
        
    }
    $scope.getProducts = function() {
           var url = '/dsn/products?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
           $http.get(url)
           .then(function(res){
              $rootScope.products = res.data;
              $scope.searchProducts();
        });
    }
    $scope.saveLayout = function() {
        $rootScope.currentLayout.regions = $scope.layoutTemplate.regions;
        $rootScope.currentLayout.width = $scope.layoutTemplate.width;
        $rootScope.currentLayout.height = $scope.layoutTemplate.height;
        $rootScope.currentLayout.template = $scope.layoutTemplate.name;
        $rootScope.currentLayout.assetType = 'Layout';
        $rootScope.currentLayout.network = encodeURIComponent($rootScope.selectedNetwork.id);
        console.log('saving layout : '+JSON.stringify($rootScope.currentLayout));
        var url = '/dsn/saveLayout'; 
        if ($rootScope.currentLayout.id) {
            url+='?lid='+$rootScope.currentLayout.id;
        }
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveLayout returned response : '+response);
            // refresh layouts on page
            $scope.getLayouts();
        });    
        
    }

    $scope.saveWebPage = function() {
        var mid = $rootScope.currentMedia.id;
        console.log('saving webPage : '+$rootScope.currentMedia);
        $rootScope.currentMedia.network = $rootScope.selectedNetwork.id;

        var url = '/dsn/saveMedia';
        if (!$rootScope.currentMedia.duration) {
            $rootScope.currentMedia.duration = GS.defaultDuration;
        }
        $rootScope.currentMedia.mimetype = 'text/html';
        if ($rootScope.currentMedia.id) {
            url+='?mid='+mid;
        }
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentMedia,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveLayout returned response : '+response);
            // refresh layouts on page
            $scope.getMedia();
            $scope.closeThisDialog();
//            $scope.propagateMediaChange(mid);
            
        });    
        
    }

    $scope.propagateMediaChange = function(mid) {
        $scope.findLayoutForMedia(mid,function(layouts) {
            if (layouts) {
                for (var lidx = 0; lidx < layouts.length; lidx++) {
                    var layout = layouts[lidx];
                    if (layout.entries) {
                        var entries = layout.entries;
                        for (var eidx = 0; eidx < entries.length; eidx++) {
                            
                        }
                    }
                }
            }

        });
    }

    $scope.propagateLayoutChange = function(lid) {
        $scope.findScheduleForLayout(lid,function(schedules) {
            if (schedules) {
                for (var sidx = 0; sidx < schedules.length; sidx++) {
                    var schedule = schedules[sidx];
                    if (schedules.layouts) {
                        var layouts = schedules.layouts;

                    }
                }
            }

        });
    }

    $scope.setFormData = function() {
        $scope.$apply(function(scope) {
            var formElement = $('#fileupload');
            console.log("formElement : "+JSON.stringify(formElement));
//            console.log('scope setFiles : '+JSON.stringify(element.files));
            // Turn the FileList object into an Array
            $rootScope.formData = new FormData(formElement);
            console.log("setFormData : "+JSON.stringify($rootScope.formData));
            $scope.progressVisible = false
        });
    };
    $scope.sendFile = function(file) {
            var uri = '/dsn/upload?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
            var xhr = new XMLHttpRequest();
            var fd = new FormData();
            
            xhr.open("POST", uri, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // Handle response.
                    alert(xhr.responseText); // handle response.
                }
            };
            fd.append('file', file);
            // Initiate a multipart/form-data upload
            xhr.send(fd);
    }
    $scope.confirm = function () {
        return confirm('Are you sure? Your local changes will be lost.');
    }

    $scope.getReqParams = function () {
        return $scope.generateErrorOnServer ? '?errorCode=' + $scope.serverErrorCode +
            '&errorMessage=' + $scope.serverErrorMsg : '';
    }

//    $scope.uploadUsing$http = function(file) {
//        file.upload = Upload.http({
//          url: '/dsn/upload' + $scope.getReqParams(),
//          method: 'POST',
//          headers: {
//            'Content-Type': file.type
//          },
//          data: file
//        });
//
//        file.upload.then(function (response) {
//          file.result = response.data;
//        }, function (response) {
//          if (response.status > 0)
//            $scope.errorMsg = response.status + ': ' + response.data;
//        });
//
//        file.upload.progress(function (evt) {
//          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
//        });
//      }

    $scope.uploadFile2 = function(file) {
//        var file = $scope.file;
        if (!file) {
          return;
        }
        Upload.upload({
          url: '/dsn/upload',
          network: encodeURIComponent($rootScope.selectedNetwork.id),
          name: file.name,
          file: file
        }).progress(function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function(data, status, headers, config) {
          console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
        }).error(function(data, status, headers, config) {
          console.log('error status: ' + status);
        })
    }
    
    $scope.uploadFile = function() {
//        var fd = $document[0].getElementById('#fileupload');
//        console.log("formfiles : "+JSON.stringify(input));
//        fd.append("files", $rootScope.files);
            for (var i in $scope.files) {
                var file = $scope.files[i];
                $scope.uploadFile2(file);
//                if (file) {
//                    var reader = new FileReader();  
//                    console.log('uploading file : '+file.name);
//                    var fd = new FormData();
//                    //console.log("$rootScope.file : "+JSON.stringify($scope.files[i]));
//                    fd.append("data", $scope.files[i]);
//                    var xhr = new XMLHttpRequest();
//                    xhr.upload.addEventListener("progress", uploadProgress, false);
//                    xhr.addEventListener("load", uploadComplete, false);
//                    xhr.addEventListener("error", uploadFailed, false);
//                    xhr.addEventListener("abort", uploadCanceled, false);
//                    xhr.open("POST", "/dsn/upload", true);
//                    xhr.setRequestHeader("Content-type", file.type);  
//                    xhr.setRequestHeader("X_FILE_NAME", file.name);
//                    $scope.progressVisible = true;
//                    console.log("formData : "+JSON.stringify(fd));
//                    //xhr.send(fd)
//                    reader.onload = function(evt) {
//                        xhr.sendAsBinary(evt.target.result);
//                    };
//                    reader.readAsBinaryString(file);
//                }
            }
    }

//    $scope.uploadFile = function() {
//            console.log("$rootScope.files : "+JSON.stringify($rootScope.files));
////            console.log("formData : "+JSON.stringify(fd));
//            var xhr = new XMLHttpRequest();
//            xhr.upload.addEventListener("progress", uploadProgress, false);
//            xhr.addEventListener("load", uploadComplete, false);
//            xhr.addEventListener("error", uploadFailed, false);
//            xhr.addEventListener("abort", uploadCanceled, false);
//            xhr.open("POST", "/dsn/upload");
//            $scope.progressVisible = true;
//            xhr.send($rootScope.formData);
//    }

//    function FileUploadCtrl(scope) {
    //============== DRAG & DROP =============
    // source for drag&drop: http://www.webappers.com/2011/09/28/drag-drop-file-upload-with-html5-javascript/
//    var dropbox = document.getElementById("dropbox")
//
//    // init event handlers
//    function dragEnterLeave(evt) {
//        evt.stopPropagation()
//        evt.preventDefault()
//        scope.$apply(function(){
//            scope.dropText = 'Drop files here...'
//            scope.dropClass = ''
//        })
//    }
//    dropbox.addEventListener("dragenter", dragEnterLeave, false)
//    dropbox.addEventListener("dragleave", dragEnterLeave, false)
//    dropbox.addEventListener("dragover", function(evt) {
//        evt.stopPropagation()
//        evt.preventDefault()
//        var clazz = 'not-available'
//        var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0
//        scope.$apply(function(){
//            scope.dropText = ok ? 'Drop files here...' : 'Only files are allowed!'
//            scope.dropClass = ok ? 'over' : 'not-available'
//        })
//    }, false)
//    dropbox.addEventListener("drop", function(evt) {
//        console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)))
//        evt.stopPropagation()
//        evt.preventDefault()
//        scope.$apply(function(){
//            scope.dropText = 'Drop files here...'
//            scope.dropClass = ''
//        })
//        var files = evt.dataTransfer.files
//        if (files.length > 0) {
//            scope.$apply(function(){
//                scope.files = []
//                for (var i = 0; i < files.length; i++) {
//                    scope.files.push(files[i])
//                }
//            })
//        }
//    }, false)
    //============== DRAG & DROP =============

//    scope.setFiles = function(element) {
//    scope.$apply(function(scope) {
//      scope.log('files:', element.files);
//      // Turn the FileList object into an Array
//        scope.files = []
//        for (var i = 0; i < element.files.length; i++) {
//          $scope.files.push(element.files[i])
//        }
//      scope.progressVisible = false
//      });
//    };


    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                $scope.progress = 'unable to compute'
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert(evt.target.responseText)
    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.")
    }

    function uploadCanceled(evt) {
        scope.$apply(function(){
            $scope.progressVisible = false
        })
        alert("The upload has been canceled by the user or the browser dropped the connection.")
    }

    //}

})
.controller("ProductDialogController", function ($scope, $rootScope, $http, Upload) {
    
    $scope.initialize = function() {
        console.log('ProductDialogController initialize()');
    }


})
.controller("MediaDialogController", function ($scope, $rootScope, $http, Upload) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
//        $scope.selectedLayout = {};
        $scope.media = [];
        $scope.numRegions = 0;
        $scope.displayElements = [];
        $scope.file;
        $scope.files = [];
        
        $scope.$watch('filesSubmitted', function(e) {
            console.log("filesSubmitted : "+e);
        });

        $scope.cUpload = function() {
            console.log("cUpload  - r : "+$scope.r+" , files : "+$scope.files);
            $scope.r.upload();
        }
        $scope.$watch('file', function() {
            var file = $scope.file;
            if (!file) {
              return;
            }
            var files = [];
            files.push(file);
            Upload.upload({
                url: '/dsn/upload',
                network: encodeURIComponent($rootScope.selectedNetwork.id),
                files: $scope.files
            }).progress(function(evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function(data, status, headers, config) {
              console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            }).error(function(data, status, headers, config) {
              console.log('error status: ' + status);
            })
        });;

        $scope.selectWheelLayout = function(le) {
            $rootScope.layoutElement = le;
            $rootScope.leType = "wheel";
        }

        $scope.selectLayoutLayout = function(le) {
            $rootScope.layoutElement = le;
            $rootScope.leType = "layout";
        }

        $scope.getLayouts = function() {
            var url = '/dsn/layouts?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
            $http.get(url)
            .then(function(res){
              $rootScope.layouts = res.data;                
            });
        }
        
        $scope.toggleDisplayElement = function(de) {
            console.log("toggleDisplayElement , checking :  "+de.id+" in displayElements.");
            for (var i=0; i < $scope.displayElements.length; i++) {
                var did = $scope.displayElements[i].id;
                if (did == de.id) {
                    console.log("removed displayELement : "+did);
                    $scope.displayElements.splice(i,1);
                    return;
                }
            }
            console.log("adding displayElement : "+de.id);
            $scope.displayElements.push(de);
        }
        $scope.saveMedia = function() {
//            $rootScope.currentSchedule.startTime = $scope.startTime;
//            $rootScope.currentSchedule.endTime = $scope.endTime;
//            $rootScope.currentSchedule.displayElements = [];
//            for (var i=0; i < $scope.displayElements.length; i++) {
//                $rootScope.currentSchedule.displayElements.push($scope.displayElements[i].id);
//            }
            if ($scope.file) {
                
            }
            $rootScope.currentMedia.network = $rootScope.selectedNetwork.id;
            console.log('saving media : '+$rootScope.currentMedia);
            var url = '/dsn/saveMedia'; 
            if ($rootScope.currentMedia.id) {
                url+='?mid='+encodeURIComponent($rootScope.currentMedia.id);
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentMedia,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
    //            callback(response);
                console.log('saveMedia returned response : '+response);
                // refresh layouts on page
//                $scope.getLayouts();
                $scope.closeThisDialog();
            });    
        }
        
        $scope.selectedDisplayElements = function() {
            var length = $scope.displayElements.length;
            console.log("selectedDisplayElements : "+length);
            var result = "";
            if (length == 0) {
                return "Nothing selected";
            } else if (length > 3) {
                var total = $scope.displaygroups.length+$scope.displays.length;
                result += $scope.displayElements.length+" out of "+total;
                return result;
            } else {
                var i = 0;
                result += $scope.displayElements[i].name;
//                console.log("selectedDisplayElements , result : "+result);
                for (i=1; i < length; i++) {
                    result = result+",";
                    result = result+$scope.displayElements[i].name;
                }
                console.log("selectedDisplayElements , result : "+result);
                return result;
            }
        }
    
        $scope.hasDisplay = function(collection, id) {
            console.log("hasDisplay , comparing :  "+id+" to : , "+collection);
            var result = false;
            for (var i=0; i < collection.length; i++) {
                var did = collection[i];
                if (did == id) {
                    console.log("returning true, id : "+id+" , display.id : "+did);
                    result = true;
                    break;
                }
                console.log("returning false");
            }
            return result;
        }

        $scope.getWheels = function() {
            
           var url = '/dsn/wheels?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
           $http.get(url)
               .then(function(res){
                  $rootScope.wheels = res.data;                
            });
        }
        
        $scope.getDisplays = function() {
           var url = '/dsn/displays?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
           $http.get(url)
               .then(function(res){
                  $scope.displays = res.data;                
            });
        }

        $scope.getDisplayGroups = function() {
           var url = '/dsn/displaygroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
           $http.get(url)
               .then(function(res){
                  $scope.displaygroups = res.data;                
            });
        }

//        $scope.updateDefaultLayout = function() {
//            console.log("updateDefaultLayout() selectedLayout : "+$scope.selectedLayout);
////            $scope.selectedLayout = layout;
//            if ($scope.selectedLayout) {
//                console.log("setting defaultLayoutId");
//                $scope.currentDisplay.defaultLayoutId = $scope.selectedLayout.id;
//            }
//        }

        $scope.updateDefaultLayout = function(display, layout) {
            console.log("updateDefaultLayout() layout : "+layout.name+" , display : "+display.name);
//            $scope.selectedLayout = layout;
//            if ($scope.selectedLayout) {
                console.log("setting defaultLayout");
                $scope.currentDisplay.defaultLayout = layout.id;
//            }
        }

        
        $scope.showStart = function() {
            console.log("startAt : "+$scope.startAt.toString());
        }
        
        $scope.initialize = function() {
            // TODO : try to put this in async parallel
            console.log("MediaDialogController initialize()");
            var today = getToday();
            $scope.startsAt = today; 
                //today.toString('yyyy-MM-dd mm:ss'); 
            console.log("setting startsAt to : "+$scope.startsAt);
            
            var tonight = getTonight();
            $scope.endsAt = tonight;
                //tonight.toString('yyyy-MM-dd mm:ss');
            console.log("setting endsAt to : "+$scope.endsAt);
            $scope.getLayouts();
            $scope.getWheels();
            $scope.getDisplays();
            $scope.getDisplayGroups();
            $scope.recursOn = "";
            $scope.recDetail = "";
//            $scope.recRange = "";
            $scope.displayOrder = 0;
            $scope.r = new Flow({
                target: '/dsn/upload',
                chunkSize: 1024*1024,
                testChunks: false
            });

        }
        
        $scope.addLayoutEntry = function(layout) {
            console.log("this would add layout entry to currentWheel :"+layout.name+" , "+$scope.currentWheel);
            if (!$rootScope.currentWheel.layouts) {
                $rootScope.currentWheel.layouts = [];
            }
            $rootScope.currentWheel.layouts.push(layout);
        }
        $scope.removeLayoutEntry = function(index) {
            console.log("this would remove layout entry from currentWheel, index :"+index+" , "+$scope.currentWheel);
            $scope.currentWheel.layouts.splice(index, 1);
        }
        $scope.whatsUp = function() {
            console.log('WheelDialogController scope : '+$rootScope.currentWheel);
        }
        $scope.saveWheel = function() {
            console.log('saving wheel : '+$rootScope.currentWheel);
            $rootScope.currentWheel.assetType = 'Wheel';
            $rootScope.currentWheel.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveWheel'; 
            if ($rootScope.currentWheel.id) {
                url+='?lid='+$rootScope.currentWheel.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentWheel,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
    //            callback(response);
                console.log('currentWheel returned response : '+response);
                // refresh layouts on page
//                $scope.getLayouts();
            });    

        }
        $scope.saveDisplay = function() {
            console.log('saving display : '+$rootScope.currentDisplay);
            $rootScope.currentDisplay.network = $rootScope.selectedNetwork.id;
            if ($scope.selectedDefaultLayout) {
                $rootScope.currentDisplay.defaultLayout = $scope.selectedDefaultLayout.id;
                $rootScope.currentDisplay.defaultLayoutType = $scope.selectedDefaultLayoutType;
            }
            var url = '/dsn/saveDisplay'; 
            if ($rootScope.currentDisplay.id) {
                url+='?did='+$rootScope.currentDisplay.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentDisplay,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
                console.log('currentWheel returned response : '+response);
            });    
        }

})
.controller("MobileController", function ($scope, $window, ngDialog,TSvc) {

    $scope.offer = {
       name : 'Name',
       title : 'Title',
       discount : 'Discount',
       description : 'Description',
       pcode : '/images/data/Product_1.png',
       cimg : '/images/data/couponImages/101161487_KTG.png'
    };
    $scope.openOfferDialog = function () {
        console.log("openDialog");
        ngDialog.open({
            template: 'offerDialog',
            showClose: false,
            controller: 'MobileController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
    };
    
    $scope.openDistributionDialog = function () {
        console.log("openDialog");
        ngDialog.open({
            template: 'distDialog',
            showClose: false,
            controller: 'MobileController',
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
    };

    $scope.closeDialog = function() {
        ngDialog.close();
    }
    $scope.calendarView = 'month';
    $scope.setCalendarView = function(v) {
        $scope.calendarView = v;
        $scope.$broadcast('calendar.refreshView');
    }
    $scope.setToday = function() {
        $scope.viewDate = new Date();
        $scope.$broadcast('calendar.refreshView');
    }

    $scope.prevCalendar = function() {
        switch ($scope.calendarView) {
            case 'day':
                $scope.viewDate = subDay($scope.viewDate,1);
                break;
            case 'week':
                $scope.viewDate = subWeek($scope.viewDate,1);
                break;
            case 'month':
                $scope.viewDate = subMonth($scope.viewDate,1);
                break;
            case 'year':
                $scope.viewDate = subYear($scope.viewDate,1);
                break;
        }
        $scope.calendarDay = $scope.viewDate;
        $scope.$broadcast('calendar.refreshView');
    }
    $scope.nextCalendar = function() {
        console.log('nextCalendar()');
        switch ($scope.calendarView) {
            case 'day':
                $scope.viewDate = addDay($scope.viewDate,1);
                break;
            case 'week':
                $scope.viewDate = addWeek($scope.viewDate,1);
                break;
            case 'month':
                $scope.viewDate = addMonth($scope.viewDate,1);
                break;
            case 'year':
                $scope.viewDate = addYear($scope.viewDate,1);
                break;
        }
        $scope.calendarDay = $scope.viewDate;
        console.log('nextCalendar() : '+$scope.viewDate);
        $scope.$broadcast('calendar.refreshView');

    }
    
//    $scope.current-day = "";
    $scope.calendarDay = new Date();
    $scope.viewDate = new Date();
    $scope.events = [
//        {
//        title: 'Mobile Coupon Schedule', // The title of the event
//        type: 'info', // The type of the event (determines its color). Can be important, warning, info, inverse, success or special
//        startsAt: new Date(2013,5,1,1), // A javascript date object for when the event starts
//        endsAt: new Date(2014,8,26,15), // Optional - a javascript date object for when the event ends
//        editable: false, // If edit-event-html is set and this field is explicitly set to false then dont make it editable.
//        deletable: false, // If delete-event-html is set and this field is explicitly set to false then dont make it deleteable
//        draggable: true, //Allow an event to be dragged and dropped
//        resizable: true, //Allow an event to be resizable
//        incrementsBadgeTotal: true, //If set to false then will not count towards the badge total amount on the month and year view
//        recursOn: 'year', // If set the event will recur on the given period. Valid values are year or month
//        //A CSS class (or more, just separate with spaces) that will be added to the event when it is displayed 
//        // on each view. Useful for marking an event as selected / active etc
//        cssClass: 'a-css-class-name' 
//        }
    ];
    $scope.modalShown = false;
    $scope.toggleModal = function() {
        $scope.modalShown = !$scope.modalShown;
    };
    $scope.menuSelection = 0;

//    $scope.templates =
//           [
//             [{name: 'schedule.html', url: '/templates/mobile/schedule.html'}],
//             [{name: 'vouchers.html', url: '/templates/mobile/distributions.html'}],
//             [{name: 'coupons.html', url: '/templates/mobile/offers.html'}],
//             [{name: 'media.html', url: '/templates/mobile/media.html'}],
//             [{name: 'datasets.html', url: '/templates/mobile/datasets.html'}],
//             [{name: 'rules.html', url: '/templates/mobile/rules.html'}],
//             [{name: 'hosted.html', url: '/templates/mobile/hosted.html'}],
//             [{name: 'events.html', url: '/templates/mobile/events.html'}],
//             [{name: 'redemptions.html', url: '/templates/mobile/redemptions.html'}]
//            ];

//             {name: 'campaigns.html', url: '/templates/mobile/campaigns.html'},
//             {name: 'brands.html', url: '/templates/mobile/brands.html'},

    
    $scope.template = $rootScope.mTemplates[MARKETABILITY][$scope.menuSelection];
    $scope.view = {
        setView: function() {
            $scope.template = $rootScope.mTemplates[MARKETABILITY][$scope.menuSelection];
            console.log('MobileController.setView : '+$scope.template.url);
            return $scope.template.url;
        },
        getView: function(v) {
            $scope.menuSelection = v;
            $scope.template = $rootScope.mTemplates[MARKETABILITY][$scope.menuSelection];
            console.log('MobileController.getView : '+$scope.template.url);
            return $scope.template.url;
        },
    };
    $scope.$on('$viewContentLoaded', function(){
        console.log('MobileController.$viewContentLoaded');
        initComponents();
    });
    
     $scope.childOnLoad = function() {
//        alert("Loaded!");
        initComponents();
//        test();
    };
    FileUploadCtrl.$inject = ['$scope']
    function FileUploadCtrl(scope) {
    //============== DRAG & DROP =============
    // source for drag&drop: http://www.webappers.com/2011/09/28/drag-drop-file-upload-with-html5-javascript/
    var dropbox = document.getElementById("dropbox")
    scope.dropText = 'Drop files here...'

    // init event handlers
    function dragEnterLeave(evt) {
        evt.stopPropagation()
        evt.preventDefault()
        scope.$apply(function(){
            scope.dropText = 'Drop files here...'
            scope.dropClass = ''
        })
    }
    dropbox.addEventListener("dragenter", dragEnterLeave, false)
    dropbox.addEventListener("dragleave", dragEnterLeave, false)
    dropbox.addEventListener("dragover", function(evt) {
        evt.stopPropagation()
        evt.preventDefault()
        var clazz = 'not-available'
        var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0
        scope.$apply(function(){
            scope.dropText = ok ? 'Drop files here...' : 'Only files are allowed!'
            scope.dropClass = ok ? 'over' : 'not-available'
        })
    }, false)
    dropbox.addEventListener("drop", function(evt) {
        console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)))
        evt.stopPropagation()
        evt.preventDefault()
        scope.$apply(function(){
            scope.dropText = 'Drop files here...'
            scope.dropClass = ''
        })
        var files = evt.dataTransfer.files
        if (files.length > 0) {
            scope.$apply(function(){
                scope.files = []
                for (var i = 0; i < files.length; i++) {
                    scope.files.push(files[i])
                }
            })
        }
    }, false)
    //============== DRAG & DROP =============

    scope.setFiles = function(element) {
    scope.$apply(function(scope) {
      console.log('files:', element.files);
      // Turn the FileList object into an Array
        scope.files = []
        for (var i = 0; i < element.files.length; i++) {
          scope.files.push(element.files[i])
        }
      scope.progressVisible = false
      });
    };

    scope.uploadFile = function() {
        var fd = new FormData()
        for (var i in scope.files) {
            fd.append("uploadedFile", scope.files[i])
        }
        var xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", uploadProgress, false)
        xhr.addEventListener("load", uploadComplete, false)
        xhr.addEventListener("error", uploadFailed, false)
        xhr.addEventListener("abort", uploadCanceled, false)
        xhr.open("POST", "/fileupload")
        scope.progressVisible = true
        xhr.send(fd)
    }

    function uploadProgress(evt) {
        scope.$apply(function(){
            if (evt.lengthComputable) {
                scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                scope.progress = 'unable to compute'
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert(evt.target.responseText)
    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.")
    }

    function uploadCanceled(evt) {
        scope.$apply(function(){
            scope.progressVisible = false
        })
        alert("The upload has been canceled by the user or the browser dropped the connection.")
    }
}


//	console.log('NetworkController template : '+$scope.template.url);
})
.controller("SensorsController", function ($scope, $window) {
    
    $scope.menuSelection = 0;

//    $scope.templates =
//           [ [{name: 'management.html', url: '/templates/sensors/management.html'}],
//             [{name: 'rules.html', url: '/templates/sensors/rules.html'}],
//             [{name: 'counts.html', url: '/templates/sensors/counts.html'}],
//             [{name: 'demographics.html', url: '/templates/sensors/demographics.html'}],
//             [{name: 'security.html', url: '/templates/sensors/security.html'}]
//            ];
    
    $scope.template = $rootScope.mTemplates[OBSERVATION][$scope.menuSelection];
    $scope.view = {
        setView: function() {
//            $scope.menuSelection = v;
            $scope.template =$rootScope.mTemplates[OBSERVATION][$scope.menuSelection];
            console.log('NetworkController.setView : '+$scope.template.url);
            return $scope.template.url;
        },
        getView: function(v) {
            $scope.menuSelection = v;
            $scope.template =$rootScope.mTemplates[OBSERVATION][$scope.menuSelection];
            console.log('NetworkController.getView : '+$scope.template.url);
            return $scope.template.url;
        }
    };
    $scope.$on('$viewContentLoaded', function(){
        console.log('SensorsController.$viewContentLoaded');
        initComponents();
    });
    
     $scope.childOnLoad = function() {
//        alert("Loaded!");
        initComponents();
//        test();
    };

//	console.log('NetworkController template : '+$scope.template.url);
})
.controller("StoreController", function ($scope, $window, TSvc) {
    
    $scope.menuSelection = 0;

//    $scope.templates =
//           [ [{name: 'products.html', url: '/templates/mobile/products.html'}],
//             [{name: 'licenses.html', url: '/templates/mobile/licenses.html'}],
//             [{name: 'cart.html', url: '/templates/mobile/cart.html'}]
//            ];
    
    $scope.template = $rootScope.mTemplates[STORE][$scope.menuSelection];
    $scope.view = {
        setView: function() {
//            $scope.menuSelection = v;
            $scope.template =$rootScope.mTemplates[STORE][$scope.menuSelection];
            console.log('NetworkController.setView : '+$scope.template.url);
            return $scope.template.url;
        },
        getView: function(v) {
            $scope.menuSelection = v;
            $scope.template = $rootScope.mTemplates[STORE][$scope.menuSelection];
            console.log('NetworkController.getView : '+$scope.template.url);
            return $scope.template.url;
        }
    };
    $scope.$on('$viewContentLoaded', function(){
        console.log('StoreController.$viewContentLoaded');
        initComponents();
    });
    
     $scope.childOnLoad = function() {
//        alert("Loaded!");
        initComponents();
//        test();
    };

})
.controller("ListCtrl", function () {
    return ['$scope', '$http', function($scope, $http) {

        $scope.description = '';
        
        $scope.itemCheck = function (data) {
            $http.get('/list/update?id=' + data.id + '&completed=' + ((data.completed) ? 0: 1));
        };

        $scope.addItem = function () {
            $http.get('/list/create?description=' + $scope.description).success(function(data) {
              $scope.items.push(data);
            });
        };

        $scope.removeItem = function (data) {
            $http['delete']('/list/' + data.id).success(function() {
              $scope.items.splice(data.index, 1);
            });
        };

        $http.get('/list/find').success(function(data) {
          for (var i = 0; i < data.length; i++) {
            data[i].index = i;
          }
          $scope.items = data;
        });
    }];
})
.controller("RuleEditDialogController", function ($scope, $rootScope, $http) {

    $scope.condition = {};
    $scope.resetConditions = function() {
        $scope.condition = {};
    }
    
    $scope.settingsBefore = {
//        dropdownToggleState: false,
//        time: {
//            fromHour: '05',
//            fromMinute: '30',
//            toHour: '10',
//            toMinute: '10'
//        },
////        theme: 'dark',
//        noRange: false,
//        format: 24,
//        noValidation: false
        dropdownToggleState: false,
        time: {},
        noRange: true,
        format: 24
//        theme: 'dark'
    };

    $scope.settingsAfter = {
//        dropdownToggleState: false,
//        time: {
//            fromHour: '05',
//            fromMinute: '30',
//            toHour: '10',
//            toMinute: '10'
//        },
////        theme: 'dark',
//        noRange: false,
//        format: 24,
//        noValidation: false
        dropdownToggleState: false,
        time: {},
        noRange: true,
        format: 24
//        theme: 'dark'
    };
 
    $scope.onTimePickerBefore = function () {
        console.log('Time range applied : '+JSON.stringify($scope.settingsBefore.time));
        $scope.condition.before = $scope.settingsBefore.time;
    };
    
    $scope.onTimePickerAfter = function () {
        console.log('Time range applied : '+JSON.stringify($scope.settingsAfter.time));
        $scope.condition.after = $scope.settingsAfter.time;
    };
    
    $scope.onClearTimePicker = function () {
        console.log('Time range current operation cancelled.');
    };
    
    $scope.before = new Date();
    $scope.displayTime = 'n/a';

    $scope.button = "Button dropdown";
    $scope.actions = [
        "Action", "Another Action", "Something else here"
    ];

    $scope.change = function(name){
        $scope.button = name;
    }

    $scope.$watch('before', function(newValue, oldValue) {
        var hour = $scope.before.getHours()-($scope.before.getHours() >= 12 ? 12 : 0),
            hour = hour<10 ? '0'+hour : hour,
            minutes = ($scope.before.getMinutes()<10 ? '0' :'') + $scope.before.getMinutes(), 
            period = $scope.before.getHours() >= 12 ? 'PM' : 'AM';
        $scope.displayTime = hour+':'+minutes+' '+period
    });

    $scope.hstep = 1;
    $scope.mstep = 15; 

    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };


    $scope.ismeridian = true;
    $scope.toggleMode = function() {
        console.log('toggleMode...');
        $scope.ismeridian = ! $scope.ismeridian;
    };

    $scope.timeOptions = {
        readonlyInput: false,
        showMeridian: false
    };
    $scope.open = {
        before: false
    };
    $scope.dates = {
        before: new Date()
    }
    $scope.onClosed = function(args) {
        console.log('onClosed...');
        $scope.closedArgs = args;
    };

    $scope.logIt = function() {
        console.log('logIt called : ');
    }

    $scope.openCalendar = function(e, date) {
        console.log('opening time calendar for : '+date);
        $scope.open[date] = true;
    };

    $scope.ruleClass = {};
    $scope.ruleClasses = [];
    $scope.media = [];
    $scope.numRegions = 0;
    $scope.ruleTemplate;
  
    $scope.initialize = function() {
        $scope.getRuleTemplates(function() {
            console.log('finished loading rule templates');
            if (!$scope.ruleTemplate) {
                $scope.ruleTemplate = $scope.ruleTemplates[0];
                $scope.ruleClasses = $scope.ruleTemplate.classes;
            }
        });
    }
        
    $scope.ruleTemplateChange = function() {
       console.log('setting ruleTemplate');
       $scope.ruleClasses = $scope.ruleTemplate.classes;     
    }

    $scope.getRules = function() {
            var url = '/dsn/rules?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
           $http.get(url)
           .then(function(res){
              $scope.rules = res.data;                
        });
    }

    $scope.getMedia = function() {
            var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
            if ($scope.selectedRegion && $scope.selectedRegion.name) {
                var searchName = $scope.selectedRegion.name.getText();
//                    console.log('searching media with type : '+searchName.toString());
//                    console.log('searchName is : '+(typeof searchName));
//                    if ("web" == searchName) {
//                        searchName = "text";
//                    }
                url += '&type='+searchName;
            }
           $http.get(url)
           .then(function(res){
              $scope.media = res.data;                
        });
    }
        
    $scope.updateMediaList = function() {
            var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
//                var url = '/dsn/media';
            if ($scope.selectedRegion && $scope.selectedRegion.name) {
                console.log('updateMediaList searching media with type : '+$scope.selectedRegion);
                url += '?type='+$scope.selectedRegion.name;
            }
           console.log('updateMediaList for : '+$scope.selectedRegion.name);
           $http.get(url)
           .then(function(res) {
              console.log('updateMediaList results : '+res.data.length);
              $scope.media = res.data;                
        });
    }
        
    $scope.getRuleTemplates = function(cb) {
       $http.get('/templates/RuleTemplates.json')
       .then(function(res){
          $scope.ruleTemplates = res.data;                
          console.log('getRuleTemplates found : '+$scope.ruleTemplates.length);
          cb();
        });
    }
        
    $scope.addMediaEntry = function(asset) {
        console.log("this would add entry to currentRegion :"+asset.name+" , "+$scope.selectedRegion.name);
        $scope.selectedRegion.entries.push(asset);
    }

    $scope.removeMediaEntry = function(index) {
        console.log("this would remove media entry from currentRegion, index :"+index+" , "+$scope.selectedRegion.name);
        $scope.selectedRegion.entries.splice(index, 1);
    }
    $scope.whatsUp = function() {
        console.log('LayoutEditDialogController scope : '+$rootScope.currentLayout);
    }
    $scope.saveRule = function() {
        var condition = {};
        $scope.condition.name = $scope.ruleTemplate.name;
        $scope.condition.type = $scope.ruleClass.type;

        $rootScope.currentRule.condition = condition;
        $rootScope.currentLayout.width = $scope.layoutTemplate.width;
        $rootScope.currentLayout.height = $scope.layoutTemplate.height;
        $rootScope.currentLayout.network = $rootScope.selectedNetwork.id;
        console.log('saving rule : '+$rootScope.currentLayout);
        var url = '/dsn/saveRule'; 
        if ($rootScope.currentRule.id) {
            url+='?rid='+$rootScope.currentRule.id;
        }
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentRule,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveLayout returned response : '+response);
            // refresh layouts on page
//                $scope.getLayouts();
        });    

    }

})
.controller("LayoutEditDialogController", function ($scope, $rootScope, $http, ngDialog, $controller, AssetSvc, CService, $filter) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
        $scope.media = [];
        $scope.numRegions = 0;
        $scope.layoutTitle = 'Add Layout';
    
        $scope.getBackgroundImage = function(image) {
            console.log('getBackgroundImage : '+image)
            if (image == 'portrait') {
                return $scope.backgroundImagePortrait.path;
            }
            if (image == 'landscape') {
                return $scope.backgroundImageLandscape.path;
            }
            console.log('showLibrary : '+id);
        }

//        $scope.showLibrary = function(id) {
//            console.log('showLibrary : '+id);
//        }

    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

    $scope.initialize = function() {
        
            $scope.getLayoutTemplates();
            $scope.getRuleTemplates();
        
            if ($rootScope.currentLayout) {
                
                var lo = $rootScope.currentLayout;
                if (lo.backgroundImageLandscape) {
                    console.log('setting backgroundLayoutImage : '+JSON.stringify(lo.backgroundImageLandscape));
                    $scope.backgroundImageLandscape = lo.backgroundImageLandscape;
                } else {
                    $scope.backgroundImageLandscape = { name: 'landscape', path:'/images/background.png', width:'1920', height:'1080' };
                }
                if (lo.backgroundImagePortrait) {
                    console.log('setting backgroundImagePortrait : '+JSON.stringify(lo.backgroundImagePortrait));
                    $scope.backgroundImagePortrait = lo.backgroundImagePortrait;
                } else {
                    $scope.backgroundImagePortrait = { name: 'portrait', path:'/images/background_portrait.png', width:'1080', height:'1920' };
                }
                
                
                console.log('initialize looking for template : '+$rootScope.currentLayout.template);
                // first get the layoutTemplates
                
               $http.get('/templates/LayoutTemplates2.json')
               .then(function(res){
                  $scope.layoutTemplates = res.data;                
                  console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
                    for (var i=0; i < $scope.layoutTemplates.length; i++) {
                        var lt = $scope.layoutTemplates[i] 
                        if (lt.name == $rootScope.currentLayout.template) {
                            console.log('initialize setting template to : '+lt);
                            $scope.layoutTemplate = lt;
                            $scope.numRegions = $rootScope.currentLayout.regions.length;
                            $scope.selectedRegion = $rootScope.currentLayout.regions[0];
//                            $scope.entries = $scope.selectedRegion.entries;
                            if (!$scope.selectedRegion.entries) {
                                $scope.selectedRegion.entries = [];
                            }
                            break;
                        }
                    }
                });

            } else {
                $scope.backgroundImageLandscape = { name: 'landscape', path:'/images/background.png', width:'1920', height:'1080' };
                $scope.backgroundImagePortrait = { name: 'portrait', path:'/images/background_portrait.png', width:'1080', height:'1920' };
                $scope.layoutTemplate = $scope.layoutTemplates[0];
            }
    }
    
    $scope.getSelectedImage = function(imgName) {
        if (imgName == 'portrait') {
            return $scope.backgroundImagePortrait;
        }
        if (imgName == 'landscape') {
           return $scope.backgroundLayoutImage; 
        }
    }
    
    $scope.assignImage = function () {
        // TODO : really for product, needs to be refactored
        console.log('assignImage, asset name : '+$rootScope.selectedAsset.name+' , imageName : '+$rootScope.imageName);
        var bgImage = {};
        bgImage.path = $rootScope.selectedAsset.path;
        bgImage.id = $rootScope.selectedAsset.id;
        bgImage.size = $rootScope.selectedAsset.size;
        bgImage.width = $rootScope.selectedAsset.width;
        bgImage.height = $rootScope.selectedAsset.height;
                    
        $rootScope.selectedAsset = '';
        $rootScope.selectedImage = '';
        console.log('assignImage : backgroundImage : '+JSON.stringify(bgImage));
//        $scope.saveLayout();
        $scope.closeThisDialog(bgImage);
    };

    $scope.saveLayout = function() {
        
        console.log('saving layout : '+JSON.stringify($rootScope.currentLayout));
        if (!$rootScope.currentLayout.regions) {
            $rootScope.currentLayout.regions = $scope.layoutTemplate.regions;
        }
        if ($scope.layoutTemplate) {
            $rootScope.currentLayout.width = $scope.layoutTemplate.width;
            $rootScope.currentLayout.height = $scope.layoutTemplate.height;
            $rootScope.currentLayout.template = $scope.layoutTemplate.name;
        }
        $rootScope.currentLayout.network = $rootScope.selectedNetwork.id;
        var url = '/dsn/saveLayout'; 
        if ($rootScope.currentLayout.id) {
            url+='?lid='+$rootScope.currentLayout.id;
        }
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('saveLayout returned response : '+response);
            $scope.closeThisDialog();
            $rootScope.currentLayout = null;
        });    
    }

    
    $scope.showLibrary = function(image, width, height, min) {
        console.log('showLibrary - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        $rootScope.selectedImage = $scope.getSelectedImage(image);
        var modal = ngDialog.open({
            template: '/templates/dsn/popups/libraryPopup.html',
            showClose: false,
//            className: 'ngdialog-theme-plain custom-height',
            className: 'ngdialog-theme-default custom-height-600',
            controller: $controller('LayoutEditDialogController', {$scope: $scope})
            
        });
        
         // Wait for the dialog to close
         // When it closes, add to return value to the orders array
         modal.closePromise.then(function(res) {
             
             console.log('showLibrary close result : '+JSON.stringify(res));
             if (res) {
                if ($rootScope.imageName == 'portrait') {
                    console.log('showLibrary close setting portrait : '+JSON.stringify(res.value));
                    $scope.backgroundImagePortrait = res.value;
                    $rootScope.currentLayout.backgroundImagePortrait = res.value;
                }
                if ($rootScope.imageName == 'landscape') {
                    console.log('showLibrary close setting landscape : '+JSON.stringify(res.value));
                    $scope.backgroundImageLandscape = res.value;
                    $rootScope.currentLayout.backgroundImageLandscape = res.value;
                }
 
             }
         });
    }

    
    $scope.getMediaD = function(width, height, min) {
                $scope.media = [];
//                var minimum  = (min) ?  1 : 0;
                console.log('LayoutAssignController getMediaD : '+width+' , '+height+' , '+min);
                var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id)+'&width='+width+'&height='+height+'&min='+min;
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('getMedia search with type : '+$scope.selectedRegion);
                    url += '?type='+$scope.selectedRegion.name;
                }
               $http.get(url)
               .then(function(res){
                  console.log('getMedia results : '+res.data.length);
                  for (var idx=0; idx < res.data.length; idx++) {
                    var asset = res.data[idx];
                    asset.id = asset._id.toString();
                    delete asset._id;
                    $scope.media.push(asset);                
                  }
                  $scope.searchMedia();
             });
    }
    $scope.getMedia = function() {
                $scope.media = [];
                
                console.log('LayoutAssignController getMedia : '+JSON.stringify($rootScope.selectedNetwork));
                var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('getMedia search with type : '+JSON.stringify($scope.selectedRegion));
                    if (!$scope.selectedRegion.name != 'content') {
                        url += '&type='+$scope.selectedRegion.name;
                    }
                }
               $http.get(url)
               .then(function(res){
                  console.log('getMedia results : '+res.data.length);
//                  for (var idx=0; idx < res.data.length; idx++) {
//                    var asset = res.data[idx];
//                    asset.id = asset._id.toString();
//                    delete asset._id;
//                    $scope.media.push(asset);                
//                  }
                  $scope.media = res.data;
//                  $scope.searchMedia();
             });
    }

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

              // init the filtered items
    $scope.searchMedia = function () {
//        console.log('searchMedia, query : '+$scope.query);
        
        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
//            for (var i=0; i < $scope.media.length; i++) {
//                
//            }
            for(var attr in item) {
//                console.log('searchMedia item : '+item.name);
//                if (searchMatch(item[attr], $scope.query)) {
                if (
                    
                    searchMatch(item.name, $scope.query) ||
                    searchMatch(item.description, $scope.query) ||
                    searchMatch(item.tags, $scope.query) ||
                    searchMatch(item.duration, $scope.query) 
                
                   ) {
//                    console.log('searchMedia returning true');
                    return true;
                }
            }
//            console.log('searchMedia returning false');
            return false;
        });
//        console.log('searchMedia Called '+$scope.filteredMedia.length);
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentPage = 1;
        // now group by pages
//        $scope.groupToPages();
        $scope.figureOutMediaToDisplay();
    };

        
    $scope.figureOutMediaToDisplay = function() {
        console.log('figureOutMediaToDisplay '+$scope.filteredMedia.length);
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var src = $scope.media;
        if ($scope.query) {
            if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
                src = $scope.filteredMedia;
                $scope.pages = src.slice(begin, end);
            } else {
                $scope.pages = [];
            }
        } else {
            $scope.pages = src.slice(begin, end);
        }
    };

//        $scope.selectedRegion = {};
        $scope.getMedia = function() {
                var url = '/dsn/media';
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    var searchName = $scope.selectedRegion.name.getText();
//                    console.log('searching media with type : '+searchName.toString());
//                    console.log('searchName is : '+(typeof searchName));
//                    if ("web" == searchName) {
//                        searchName = "text";
//                    }
                    url += '?type='+searchName;
                }
               $http.get(url)
               .then(function(res){
                  $scope.media = res.data; 
                  $scope.searchMedia();
            });
        }
        $scope.updateMediaList = function() {
                var url = '/dsn/media';
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('updateMediaList searching media with type : '+$scope.selectedRegion);
                    url += '?type='+$scope.selectedRegion.name;
                }
               $http.get(url)
               .then(function(res){
                  console.log('updateMediaList results : '+res.data.length);
                  $scope.media = res.data;                
            });
        }
        
        $scope.getLayoutTemplates = function() {
           $http.get('/templates/LayoutTemplates2.json')
           .then(function(res){
              $scope.layoutTemplates = res.data;                
              console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
            });
        }
        
        $scope.addMediaEntry = function(asset) {
            console.log("this would add entry to currentRegion :"+asset.name+" , "+$scope.selectedRegion.name);
            $scope.selectedRegion.entries.push(asset);
        }
        
        $scope.removeMediaEntry = function(index) {
            console.log("this would remove media entry from currentRegion, index :"+index+" , "+$scope.selectedRegion.name);
            $scope.selectedRegion.entries.splice(index, 1);
        }
        
        $scope.whatsUp = function() {
            console.log('LayoutEditDialogController scope : '+$rootScope.currentLayout);
        }
        

})
.controller("LayoutAssignDialogController", function ($scope, $rootScope, $http, $filter) {

  var sortingOrder = 'name';

  $scope.layoutTemplate = {};
  $scope.layoutTemplates = [];

  $scope.currentMediaPage = 0;
  $scope.mediaPageSize = 20;
  $scope.totalMedia = 200;
  $scope.numRegions = 0;
  $scope.currentMediaPage = 0;
  $scope.query = '';  
  $scope.media = [];
  $scope.sortingOrder = sortingOrder;
  $scope.reverse = false;
  $scope.filteredMedia = [];
  $scope.pages = [];

  $scope.numPerPage = 20;
  $scope.itemsPerPage = 12;
  $scope.maxSize = 5;
    
    $scope.updatedMedia = function() {
        console.log('updateMedia()');
        $scope.getMedia();
    }

    var searchMatch = function (haystack, needle) {
        if (!needle) {
//            console.log('searchMatch - needle is false');
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

      // init the filtered items
    $scope.searchMediaNot = function () {
        console.log('LayoutAssignDialogController.searchMedia()');
        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
            for(var attr in item) {
                if (searchMatch(item[attr], $scope.query))
                    return true;
            }
            return false;
        });
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentMediaPage = 0;
        // now group by pages
        $scope.groupToPages();
    };

//    this.$inject = ['$scope','$filter'];

       // calculate page in place
    $scope.groupToPages = function () {
        console.log('LayoutAssignDialogController.groupToPages()');
        $scope.pages = [];
        
        if ($scope.filteredMedia) {
            for (var i = 0; i < $scope.filteredMedia.length; i++) {
                if (i % $scope.itemsPerPage === 0) {
                    $scope.pages[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredMedia[i] ];
                } else {
                    $scope.pages[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredMedia[i]);
                }
            }
        }
    };
   
    $scope.figureOutMediaToDisplay = function() {
        console.log('figureOutMediaToDisplay '+$scope.filteredMedia.length);
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var src = $scope.media;
        if ($scope.query) {
            if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
                src = $scope.filteredMedia;
                $scope.pages = src.slice(begin, end);
            } else {
                $scope.pages = [];
            }
        } else {
            $scope.pages = src.slice(begin, end);
        }
    };

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
        if ($scope.currentMediaPage > 0) {
            $scope.currentMediaPage--;
        }
    };
    
    $scope.nextPage = function () {
        if ($scope.currentMediaPage < $scope.pages.length - 1) {
            $scope.currentMediaPage++;
        }
    };
    
    $scope.setPage = function () {
        $scope.currentMediaPage = this.n;
    };

    $scope.getMediaPageCount = function() {
        var count = $scope.getMediaLength()/$scope.itemsPerPage;
        return(Math.ceil(count));
    }
    
    $scope.getMediaLength = function() {
        var l = 0;
        var src = $scope.media;
        if ($scope.query) {
            if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
                console.log('getMediaLength returning '+$scope.filteredMedia.length);
                src = $scope.filteredMedia;
            } else {
                src = [];
            }
        }
        if (src) {
            l = src.length;
        }
        return l;
    }

    // change sorting order
    $scope.sort_by = function(newSortingOrder) {
        if ($scope.sortingOrder == newSortingOrder)
            $scope.reverse = !$scope.reverse;

        $scope.sortingOrder = newSortingOrder;

        // icon setup
        $('th i').each(function(){
            // icon reset
            $(this).removeClass().addClass('icon-sort');
        });
        if ($scope.reverse)
            $('th.'+new_sorting_order+' i').removeClass().addClass('icon-chevron-up');
        else
            $('th.'+new_sorting_order+' i').removeClass().addClass('icon-chevron-down');
    };

    $scope.mediaPageChanged = function() {
        console.log("currentMediaPage changed ...");
        if ($scope.media && $scope.media.length > 0) {
            var begin = (($scope.currentMediaPage - 1) * $scope.numPerPage), 
                end = begin + $scope.numPerPage;
            $scope.filteredMedia = $scope.media.slice(begin, end);
        }
    }

    
    $scope.initMediaPaging = function() {
        $scope.getMedia();
        $scope.filteredMedia = $scope.media.slice(0, $scope.numPerPage);
    }
    
    $scope.initialize = function() {
        console.log('LayoutAssignController initialize()');
        if ($rootScope.currentLayout) {
            $scope.numRegions = $rootScope.currentLayout.regions.length;
            $scope.selectedRegion = $rootScope.currentLayout.regions[0];
            if (!$scope.selectedRegion.entries) {
                $scope.selectedRegion.entries = [];
            }
//             $scope.initMediaPaging();
            $scope.getMedia();
        }
    }
    
    $scope.getMediaD = function(width, height, min) {
                $scope.media = [];
//                var minimum  = (min) ?  1 : 0;
                console.log('LayoutAssignController getMediaD : '+width+' , '+height+' , '+min);
                var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id)+'&width='+width+'&height='+height+'&min='+min;
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('getMedia search with type : '+$scope.selectedRegion);
                    url += '?type='+$scope.selectedRegion.name;
                }
               $http.get(url)
               .then(function(res){
                  console.log('getMedia results : '+res.data.length);
                  for (var idx=0; idx < res.data.length; idx++) {
                    var asset = res.data[idx];
                    asset.id = asset._id.toString();
                    delete asset._id;
                    $scope.media.push(asset);                
                  }
                  $scope.searchMedia();
             });
    }
    $scope.getMedia = function() {
                $scope.media = [];
                
                console.log('LayoutAssignController getMedia : '+JSON.stringify($rootScope.selectedNetwork));
                var url = '/dsn/media?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('getMedia search with type : '+JSON.stringify($scope.selectedRegion));
                    if (!$scope.selectedRegion.name != 'content') {
                        url += '&type='+$scope.selectedRegion.name;
                    }
                }
               console.log('LayoutAssignController.getMedia - url : '+url);
               $http.get(url)
               .then(function(res){
                  console.log('LayoutAssignController.getMedia - results : '+JSON.stringify(res));
                  console.log('LayoutAssignController.getMedia - results : '+res.data.length);
                  for (var idx=0; idx < res.data.length; idx++) {
                    var asset = res.data[idx];
                    $scope.media.push(asset);                
                  }
//                  $scope.media = res.data;
//                  $scope.searchMedia();
             });
    }
    
    $scope.searchMedia = function () {
        console.log('LayoutAssignDialogController.searchMedia, query : '+$scope.query);
        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
            for(var attr in item) {
//                console.log('searchMedia item : '+item.name);
//                if (searchMatch(item[attr], $scope.query)) {
                if (

                    searchMatch(item.name, $scope.query) ||
                    searchMatch(item.description, $scope.query) ||
                    searchMatch(item.tags, $scope.query) ||
                    searchMatch(item.duration, $scope.query) 

                   ) {
//                    console.log('searchMedia returning true');
                    return true;
                }
            }
//            console.log('searchMedia returning false');
            return false;
        });
        
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentMediaPage = 1;
        // now group by pages
//        $scope.groupToPages();
        $scope.figureOutMediaToDisplay();

    }
    $scope.updateMediaList = function() {
                var url = '/dsn/media';
                console.log('updateMediaList - media with type : '+$scope.selectedRegion);
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    url += '?type='+$scope.selectedRegion.name;
                }
               $http.get(url)
               .then(function(res){
                  $scope.media = [];
                  for (var idx=0; idx < res.data.length; idx++) {
                    var asset = res.data[idx];
                    asset.id = asset._id.toString();
                    delete asset._id;
                    $scope.media.push(asset);                
                  }
            });
    }
    
    $scope.getLayoutTemplates = function() {
       $http.get('/templates/LayoutTemplates2.json')
       .then(function(res){
          $scope.layoutTemplates = res.data;                
          console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
        });
    }
        
    $scope.addMediaEntry = function(asset) {
        console.log("this would add entry to currentRegion :"+asset.name+" , "+$scope.selectedRegion.name);
        if (!$scope.selectedRegion.entries) {
            $scope.selectedRegion.entries = [];
        }

        $scope.selectedRegion.entries.push(asset);
    }
        
    $scope.removeMediaEntry = function(index) {
        console.log("this would remove media entry from currentRegion, index :"+index+" , "+$scope.selectedRegion.name);
        $scope.selectedRegion.entries.splice(index, 1);
    }

    $scope.whatsUp = function() {
        console.log('LayoutAssignDialogController scope : '+$rootScope.currentLayout);
    }

    $scope.closeDialog = function() {
        console.log('closeDialog()...');
        ngDialog.close();
    }


    $scope.saveLayout = function() {
            console.log('LayoutAssignDialogController saveLayout'+$rootScope.currentLayout);
            if (!$rootScope.currentLayout.regions) {
                $rootScope.currentLayout.regions = $scope.layoutTemplate.regions;
            }
            // gregm TODO: difficult transition from region with embedded assets to region with asset ids
//            var lregions = [];
//            for (var i = 0; i < $rootScope.currentLayout.regions.length; i++) {
//                var entries = [];
//                
//                
//            }
            $rootScope.currentLayout.width = $scope.layoutTemplate.width;
            $rootScope.currentLayout.height = $scope.layoutTemplate.height;
            $rootScope.currentLayout.network = $rootScope.selectedNetwork.id;
            console.log('saving layout : '+$rootScope.currentLayout);
            var url = '/dsn/saveLayout'; 
            if ($rootScope.currentLayout.id) {
                url+='?lid='+$rootScope.currentLayout.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentLayout,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
    //            callback(response);
                console.log('saveLayout returned response : '+response);
                $scope.closeThisDialog();

                // refresh layouts on page
//                $scope.getLayouts();
            });    

        }

})
.controller("WheelDialogController", function ($scope, $rootScope, $http) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
        $scope.selectedRegion = {};
        $scope.media = [];
        $scope.numRegions = 0;
        $scope.getAnnouncements = function() {
               $rootScope.announcements = {};                
               var url = '/dsn/announcements?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
               $http.get(url)
               .then(function(res){
                  $rootScope.announcements = res.data;                
            });
        }

        $scope.getProducts = function() {
               $rootScope.products = {};                
               var url = '/dsn/products?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
               $http.get(url)
               .then(function(res){
                  $rootScope.products = res.data;                
            });
        }

        $scope.getProductGroups = function() {
               $rootScope.productGroups = {};                
               var url = '/dsn/productGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
               $http.get(url)
               .then(function(res){
                  $rootScope.productGroups = res.data;                
            });
        }

        $scope.getAnnouncementGroups = function() {
               $rootScope.announcementGroups = {};                
               var url = '/dsn/announcementGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
               $http.get(url)
               .then(function(res){
                  $rootScope.announcementGroups = res.data;                
            });
        }

    
        $scope.getLayouts = function() {
               var url = '/dsn/layouts?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
               $http.get(url)
               .then(function(res){
                  $rootScope.layouts = res.data;                
            });
        }
        
        $scope.initialize = function() {
            $scope.getLayouts();
            $scope.getProducts();
            $scope.getAnnouncements();
            $scope.getProductGroups();
            $scope.getAnnouncementGroups();
            if ($rootScope.currentWheel) {
                $scope.numLayouts = $rootScope.currentWheel.layouts.length;
            } else {
                $rootScope.currentWheel = {};
            }
        }
        
        $scope.getRuleTemplates = function() {
           $http.get('/templates/RuleTemplates.json')
           .then(function(res){
              $scope.ruleTemplates = res.data;                
              console.log('getRuleTemplates found : '+$scope.ruleTemplates.length);
            });
        }

        $scope.getLayoutTemplates = function() {
           $http.get('/templates/LayoutTemplates2.json')
           .then(function(res){
              $scope.layoutTemplates = res.data;                
              console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
            });
        }
        
        $scope.addLayoutEntry = function(layout) {
            console.log("this would add layout entry to currentWheel :"+layout.name+" , "+$scope.currentWheel);
            if (!$rootScope.currentWheel.layouts) {
                $rootScope.currentWheel.layouts = [];
            }
            $rootScope.currentWheel.layouts.push(layout);
        }
        $scope.removeLayoutEntry = function(index) {
            console.log("this would remove layout entry from currentWheel, index :"+index+" , "+$scope.currentWheel);
            $scope.currentWheel.layouts.splice(index, 1);
        }
        $scope.whatsUp = function() {
            console.log('WheelDialogController scope : '+$rootScope.currentWheel);
        }
        $scope.saveWheel = function() {
            console.log('saving wheel : '+$rootScope.currentWheel);
            $rootScope.currentWheel.assetType = 'Wheel';
            $rootScope.currentWheel.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveWheel'; 
            if ($rootScope.currentWheel.id) {
                url+='?lid='+$rootScope.currentWheel.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentWheel,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
    //            callback(response);
                console.log('currentWheel returned response : '+response);
                // refresh layouts on page
//                $scope.getLayouts();
            });    

        }

})
.controller("DisplayDialogController", function ($scope, $rootScope, $http) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
//        $scope.selectedDefaultLayout;
        $scope.selectedDefaultLayoutType = "";
    
//        $scope.selectedLayout = {};
        $scope.media = [];
        $scope.numRegions = 0;
    
        $scope.getSelectedDefaultLayoutName = function() {
            var name = "none";
            if ($scope.selectedDefaultLayout) {
                var l = $scope.selectedDefaultLayout;
                name = l.name;
            }
//            if ($rootScope.currentDisplay) {
//                var lt = 'layout';
//                lt = $rootScope.currentDisplay.defaultLayoutType;
//                var l;
//                if (lt == 'wheel') {
//                    l = oForID($rootScope.wheels, $rootScope.currentDisplay.defaultLayout);
//                    name = l.name;
//                } else {
//                    l = oForID($rootScope.layouts, $rootScope.currentDisplay.defaultLayout);
//                    name = l.name;
//                }
//            }
//            console.log('getSelectedDefaultLayoutName, returning : '+name);
            return name;
        }

        $scope.generateLicense = function() {
            console.log('generateLicense ... ');
            if ($rootScope.currentDisplay.license) {
                $rootScope.currentDisplay.licensed = false;
                $rootScope.currentDisplay.license = '';
            } else {
                var key = generateLicenseKey(32, '#aA');
                $rootScope.currentDisplay.license = key;
                $rootScope.currentDisplay.licensed = true;
            }
        } 
        
        $scope.getWheelById = function(id) {
           for (var idx=0; idx < $rootScope.wheels.length; idx++) {
                    var wheel = $rootScope.wheels[idx];
                    if (wheel.id == id) {
                        return wheel;
                    }
          }
        }
        $scope.getLayoutById = function(id) {
           for (var idx=0; idx < $rootScope.layouts.length; idx++) {
                    var layout = $rootScope.layouts[idx];
                    if (layout.id == id) {
                        return layout;
                    }
          }
        }
        $scope.selectDefaultLayoutChange = function(le) {
            console.log('selectDefaultLayoutChange :  '+JSON.stringify(le));
        }

        $scope.selectLayoutElement = function(le) {
            $scope.selectedDefaultLayout = le;
            $scope.selectedDefaultLayoutType = 'layout';
            if ($rootScope.currentDisplay) {
                $rootScope.currentDisplay.defaultLayout = le.id;
                $rootScope.currentDisplay.defaultLayoutType = 'layout';
            }
            console.log('selectLayoutElement :  '+le.id);
        }


        $scope.selectWheelElement = function(le) {
//            $rootScope.leType = 'wheel';
//            $rootScope.layoutElement = le;
            $scope.selectedDefaultLayoutType = 'wheel';
            $scope.selectedDefaultLayout = le;
            if ($rootScope.currentDisplay) {
                $rootScope.currentDisplay.defaultLayout = le.id;
                $rootScope.currentDisplay.defaultLayoutType = 'wheel';
            }
            console.log('selectWheelElement :  '+le.id);
        }

        $scope.getWheels = function() {
           var url = '/dsn/wheels?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
               .then(function(res){
                  $rootScope.wheels = res.data;                
            });
        }
        
        $scope.defaultLayoutSelected = function(le) {
            console.log('selectedDefaultLayout : '+le.id);
            if ($scope.selectedDefaultLayout && le.id == $scope.selectedDefaultLayout.id) {
                return true;    
            }
            return false;    
        }
        
        $scope.updateDefaultLayout = function(display, layout) {
            console.log("updateDefaultLayout() layout : "+layout);
//            $scope.selectedLayout = layout;
            if (layout) {
                console.log("setting defaultLayout");
                display.defaultLayout = layout.id;
            }
        }
        
        $scope.getLayouts = function() {
            var url = '/dsn/layouts?nid='+$rootScope.selectedNetwork.id;
            $http.get(url)
            .then(function(res){
              $rootScope.layouts = res.data;                
            });
        }
        
        $scope.initialize = function() {
//            $scope.getLayouts();
//            $scope.getWheels();
            console.log("DisplayDialogController.initialize().");
            if (!$rootScope.currentDisplay) {
                $rootScope.currentDisplay = {};
            }
            var cd = $rootScope.currentDisplay;
            if (cd.defaultLayout) {
                console.log("loading default layout from API  : "+cd.defaultLayout);
                var ltype = 'layout';
                if (cd.defaultLayoutType) {
                    layoutType = cd.defaultLayoutType;
                }
                if (ltype == 'wheel') {
                    $scope.selectedDefaultLayout = $scope.getWheelById($rootScope.currentDisplay.defaultLayout);
                    $scope.selectedDefaultLayoutType = "wheel";
                } else {
                    $scope.selectedDefaultLayout = $scope.getLayoutById($rootScope.currentDisplay.defaultLayout);
                    $scope.selectedDefaultLayoutType = "layout";
                }
                
//                    var url = '/dsn/layout?lid='+$rootScope.currentDisplay.defaultLayout; 
//                    if ($rootScope.currentDisplay.defaultLayoutType == 'wheel') {
//                        url = '/dsn/wheel?wid='+$rootScope.currentDisplay.defaultLayout; 
//                    }
//                    $http({
//                        url: url,
//                        method: "POST",
//                        data: $rootScope.currentDisplay.defaultLayout,
//                        headers: {'Content-Type': "application/json" }
//                    }).success(function (response) {
//                        console.log('DisplayDialogController : initialize returned response : '+response);
//                        $scope.selectedDefaultLayout = response;
//                    });    

            }
            
        }
        
        $scope.addLayoutEntry = function(layout) {
            console.log("this would add layout entry to currentWheel :"+layout.name+" , "+$scope.currentWheel);
            if (!$rootScope.currentWheel.layouts) {
                $rootScope.currentWheel.layouts = [];
            }
            $rootScope.currentWheel.layouts.push(layout);
        }
        $scope.removeLayoutEntry = function(index) {
            console.log("this would remove layout entry from currentWheel, index :"+index+" , "+$scope.currentWheel);
            $scope.currentWheel.layouts.splice(index, 1);
        }
        $scope.whatsUp = function() {
            console.log('WheelDialogController scope : '+$rootScope.currentWheel);
        }
        $scope.saveWheel = function() {
            console.log('saving wheel : '+$rootScope.currentWheel);
            $rootScope.currentWheel.assetType = 'Wheel';
            $rootScope.currentWheel.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveWheel'; 
            if ($rootScope.currentWheel.id) {
                url+='?lid='+$rootScope.currentWheel.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentWheel,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
    //            callback(response);
                console.log('currentWheel returned response : '+response);
                // refresh layouts on page
//                $scope.getLayouts();
            });    

        }
        
        $scope.licensed = function() {
            return $rootScope.currentDisplay.licensed;
        }
        
        $scope.saveDisplay = function() {
            console.log('saving display : '+JSON.stringify($rootScope.currentDisplay));
//            console.log('saving display : '+JSON.stringify($scope.selectedDefaultLayout.id));
            if ($scope.selectedDefaultLayout) {
                $rootScope.currentDisplay.defaultLayoutType = $scope.selectedDefaultLayoutType;
                $rootScope.currentDisplay.defaultLayout = $scope.selectedDefaultLayout.id;
            }
            $rootScope.currentDisplay.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveDisplay'; 
            if ($rootScope.currentDisplay.id) {
                url+='?did='+$rootScope.currentDisplay.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentDisplay,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
                console.log('currentWheel returned response : '+response);
            }); 
            $scope.closeThisDialog();

        }
        
        $scope.cancelEditDisplay = function() {
            $rootScope.currentDisplay = null;
            $scope.closeThisDialog();
        }
        

})
.controller("DGroupDialogController", function ($scope, $rootScope, $http) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
//        $scope.selectedLayout = {};
        $rootScope.dialogTitle = 'Add Display Group';

        $scope.media = [];
        $scope.numRegions = 0;
        $scope.assignedDisplays = [];
        $scope.availabledisplays = [];
        $scope.getAllDisplays = function(cb) {
               $http.get('/dsn/displays')
               .then(function(res) {
                  $scope.displays = res.data;
                  console.log("getAllDisplays returns : "+$scope.displays.length);
                  cb();
            });
        }
        
        $scope.initialize = function() {
            console.log("DGroupDialogController.initialize() calling getAllDisplays...")
            $scope.getAllDisplays(function () {
                console.log("initialize, in callback()");
                var entries = [];
                if ($rootScope.currentDisplayGroup) {
                    if (!$rootScope.currentDisplayGroup.displays) {
                        $rootScope.currentDisplayGroup.displays = [];
                    }
                    entries = $rootScope.currentDisplayGroup.displays;
                    console.log("initiliaize : "+entries);
                } else {
                    $rootScope.currentDisplayGroup = {};
                }
                for (var i=0; i < $scope.displays.length; i++) {
                    var display = $scope.displays[i];
                    if ($scope.hasDisplay(entries, display.id)) {
                        $scope.assignedDisplays.push(display)
                    } else {
                        $scope.availabledisplays.push(display);
                    }
                }
            });
        }
        $scope.hasDisplay = function(collection, id) {
            console.log("hasDisplay , comparing :  "+id+" to : , "+collection);
            var result = false;
            for (var i=0; i < collection.length; i++) {
                var did = collection[i];
//                console.log("id type : "+id.constructor.toString());
//                var did = display.id;
//                console.log("display.id type : "+did.constructor.toString());
                if (did == id) {
                    console.log("returning true, id : "+id+" , display.id : "+did);
                    result = true;
                    break;
                }
                console.log("returning false");
            }
            return result;
        }
        $scope.getDisplayIndex = function(collection, id) {
            var i = -1;
            for (i=0; i < collection.length; i++) {
                var display = collection[i];
                if (id == display.id) {
                    break;
                }
                i = -1;
            }
            return i;
        }
        $scope.addDisplayEntry = function(display) {
            console.log("this would add display entry to currentDisplayGroup :"+display.name+" , "+$scope.currentDisplayGroup);
            if (!$rootScope.currentDisplayGroup.displays) {
                $rootScope.currentDisplayGroup.displays = [];
            }
            $rootScope.currentDisplayGroup.displays.push(display.id);
            $scope.assignedDisplays.push(display);
            var dindex = $scope.getDisplayIndex(display);
            if (dindex >= 0) {
                $scope.availabledisplays.splice(dindex,1);
            }
        }
        $scope.removeDisplayEntry = function(index) {
            console.log("this would remove layout entry from currentWheel, index :"+index+" , "+$scope.currentDisplayGroup);
            var display = $scope.currentDisplayGroup.displays.splice(index, 1);
            $scope.availabledisplays.push(display);
        }
        $scope.saveDisplayGroup = function() {
            console.log('saving display group: '+$rootScope.currentDisplayGroup);
            $rootScope.currentDisplayGroup.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveDisplayGroup';
            console.log("saveDisplayGroup : "+JSON.stringify($rootScope.currentDisplayGroup));
            if ($rootScope.currentDisplayGroup.id) {
                url+='?dgid='+$rootScope.currentDisplayGroup.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentDisplayGroup,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
                console.log('currentWheel returned response : '+response);
            });    

        }

})

.controller("ProductGroupDialogController", function ($scope, $rootScope, $http) {
        $scope.saveProductGroup = function() {
            if ($rootScope.currentProductGroup) {
                console.log('saving display group: '+$rootScope.currentProductGroup);
                $rootScope.currentProductGroup.network = $rootScope.selectedNetwork.id;
                var url = '/dsn/saveProductGroup';
                console.log("saveProductGroup : "+JSON.stringify($rootScope.currentProductGroup));
                if ($rootScope.currentProductGroup.id) {
                    url+='?pgid='+$rootScope.currentProductGroup.id;
                }
                $http({
                    url: url,
                    method: "POST",
                    data: $rootScope.currentProductGroup,
                    headers: {'Content-Type': "application/json" }
                }).success(function (response) {
                    $scope.closeThisDialog();
                    console.log('currentWheel returned response : '+response);
                });    
            }
        };
    
})

.controller("FeedGroupDialogController", function ($scope, $rootScope, $http) {
})

.controller("AnnouncementGroupDialogController", function ($scope, $rootScope, $http) {
})
.controller("ScheduleDialogController", function ($scope, $rootScope, $http, dateFilter, AssetSvc ) {

        var today = getToday();
        var tonight = getTonight();
        var tomorrow = getTomorrow();

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
//        $scope.selectedLayout = {};
        $scope.media = [];
        $scope.numRegions = 0;
        $scope.displayElements = [];
    
        $scope.startsAtOpened = false;
        $scope.endsAtOpened = false;
        $scope.startDateOpened = false;

        $scope.recRangeOpen = false;
    
        $scope.showGeneralTab = true;
        $scope.showRepeatsTab = false;
    
        $scope.repeatsEnabled = false;
//        $scope.repeatsStyle = {'display': ($repeatsEnabled) ? 'flex' : 'none' }
    
        $scope.repeatType = 'weekly'; // dayly, weekly, monthly, yearly
        $scope.dayType = 'day';  // day, weekday, weekend
        $scope.dayCount = 1;
        $scope.weekCount = 1;
        $scope.weekDay = {};
        $scope.monthType = 'day';   // day, ordinal
        $scope.monthDay = "1";
        $scope.monthCount = 1;

        $scope.monthDay2 = "1";
        $scope.monthCount2 = 1;

        $scope.monthDay3 = "1";

        $scope.yearCount = 1;
        $scope.yearRecurCount = 1;
    
        $scope.yearDay = 1;
        $scope.yearType = "day";
        $scope.yearMonth = "0";
        $scope.yearMonth2 = "0";
        $scope.yearOrdinal = "1";
        $scope.yearWeekday = "1";
        $scope.yearWeek = 1;
        $scope.repeatEnd = "none";

        $scope.yearWeek2 = "bbbb";
        $scope.repeatCount = 1;
    
    
        $scope.month_count = 1;
        $scope.month_count2 = 1;

        $scope.recurrence = {
            
                enabled : false,
                type : 'weekly', // dayly, weekly, monthly, yearly
                dayType : 'day',  // day, weekday, weekend
                dayCount : 1,
            
                weekCount : 1,
                week : {},
            
                monthType : 'day',   // day, ordinal
                monthDate : "1",
                monthCount : 1,
                monthDay: "1",
                monthDayOrdinal: "1",
                monthDayType : "1",
//                monthCount2 : 1,
//
//                monthDay3 : "1",

                yearCount : 1,
                yearRecurCount : 1,

                yearDay : 1,
                yearType : "day",
                yearMonth : "0",
//                yearMonth2 : "0",
                yearOrdinal : "1",
            
                yearWeekday : "1",
//                yearWeek : 1,
                repeatEnd : "none",

                endDate :  tonight,
                repeatCount : 1,
            
        };

    
        $scope.dateFormat = 'MMM dd yyyy';
        $scope.timeFormat = 'h : mm';
        $scope.format = "h : mm";
        $scope.min = null;
        $scope.max = null;
    
        $scope.recurrenceCheck = function() {
            if ($scope.recurrence.enabled) {
                console.log('recurrence turned on : '+JSON.stringify($scope.recurrence));
            }
        };

        $scope.initialize = function() {
            // TODO : try to put this in async parallel
            console.log('ScheduleDialogController initialize() recurrence at init : '+JSON.stringify($scope.recurrence));
            $scope.getLayouts();
            $scope.getWheels();
            $scope.getDisplays();
            $scope.getDisplayGroups();
            $scope.repeatsSelected = "";
            $scope.displayOrder = 0;
            if ($rootScope.currentSchedule) {
                var schedule = $rootScope.currentSchedule;
                if (schedule.title) $scope.title = $rootScope.currentSchedule.title; 
                if (schedule.startDate) $scope.startDate = new Date($rootScope.currentSchedule.startDate); 
                if (schedule.startsAt) $scope.startsAt = new Date($rootScope.currentSchedule.startsAt); 
                if (schedule.endsAt) $scope.endsAt = new Date($rootScope.currentSchedule.endsAt); 
//                if (schedule.recurrence) $scope.recurrence.endDate = new Date($rootScope.currentSchedule.recurrence.endDate); 
                if (schedule.recurrence) {
                    
                    console.log('set recurrence from currentSchedule');
                    $scope.recurrence = $rootScope.currentSchedule.recurrence;
                }
                if (schedule.displayElements) {
                    console.log('loading displayElements from currentSchedule');
                    $scope.displayElements = [];
                    for (var i=0; i < schedule.displayElements.length; i++) {
                        var did = schedule.displayElements[i];
                        var display = AssetSvc.getDisplay(did);
                        if (display) {
                            $scope.displayElements.push(display);
                        }
                    }
                }
            }
            

        }

        $scope.modalDialog = {
            "width": "660px !important",
            "height": "680px"
        }
        
        $scope.repeat_end = 'none';
    
        $scope.repeatEnabled = function(t) {
            var enabled = (t == $scope.recurrence.repeatEnd)
            //console.log('repeatEnabled returning '+enabled+' ,  t = '+t+' re = '+$scope.repeat_end);
            return enabled;
        }
        
        //$scope.startsAt = new Date(); 
        $scope.startDate = today;
        $scope.endDate = tomorrow;
        $scope.startsAt = today;
    //dateFilter(today, ' h : mm a');
//            moment().format('h:mm a');
        $scope.endsAt = tonight;
//            dateFilter(tonight, ' h : mm a');
//            new Date();
        $scope.repeat_end = "none";
        $scope.$watch('startDate', function() {
            console.log('startDate watch, adjusting startsAt and endsAt.');
            $scope.startsAt = adjustDate($scope.startDate, $scope.startsAt);
            $scope.endsAt = adjustDate($scope.startDate, $scope.endsAt);
        });

        $scope.areRepeatsEnabled = function() {
            console.log('areRepeatsEnabled returning '+$scope.repeatsEnabled);
            return $scope.repeatsEnabled;
        }
        
        $scope.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };

        $scope.selectTab = function(tab) {
            if (tab == 'general') {
                $scope.showGeneralTab = true;
                $scope.showGeneralTab = false;
            }
            if (tab == 'repeats') {
                $scope.showGeneralTab = true;
                $scope.showGeneralTab = false;
            }
        }
        $scope.disabled = function(date, mode) {
            return false;
            //(mode === 'day' && (new Date().toDateString() == date.toDateString()));
        };

        $scope.openStartDateCalendar = function(e, date) {
            $scope.startDateOpen = true;
        };

        $scope.openStartsAtCalendar = function(e, date) {
            $scope.startsAtOpen = true;
        };

        $scope.openEndsAtCalendar = function(e, date) {
            $scope.endsAtOpen = true;
        };

        $scope.openRecRangeCalendar = function(e, date) {
            $scope.recRangeOpen = true;
        };

    
        $scope.selectLayoutElement = function(le) {
            $rootScope.leType = 'layout';
            $rootScope.layoutElement = le;
        }

        $scope.selectWheelElement = function(le) {
            $rootScope.leType = 'wheel';
            $rootScope.layoutElement = le;
        }

        $scope.getLayouts = function() {
            var url = '/dsn/layouts?nid='+$rootScope.selectedNetwork.id;
            $http.get(url)
            .then(function(res){
              $rootScope.layouts = res.data;                
            });
        }
        
        $scope.initTimePicker = function(selectedDate) {
            var min = new Date(selectedDate.getTime());
            min.setHours(2);
            min.setMinutes(0);
            $scope.min = min;

            var max = new Date(selectedDate.getTime());
            max.setHours(4);
            max.setMinutes(0);
            $scope.max = max;
        }

//        $scope.hideElements = function() {
//            document.getElementById(id).style.property="none";
//            document.getElementById(id).style.property="none";
//        }

        $scope.toggleDisplayElement = function(de) {
            console.log("toggleDisplayElement , checking :  "+de.id+" in displayElements.");
            for (var i=0; i < $scope.displayElements.length; i++) {
                var did = $scope.displayElements[i].id;
                if (did == de.id) {
                    console.log("removed displayELement : "+did);
                    $scope.displayElements.splice(i,1);
                    return;
                }
            }
            console.log("adding displayElement : "+de.id);
            $scope.displayElements.push(de);
        }
        
        $scope.saveSchedule = function() {
            
            $rootScope.currentSchedule.title = $scope.title;
            $rootScope.currentSchedule.startDate = $scope.startDate;
            if ($scope.startDate)  {
            }
            $rootScope.currentSchedule.startsAt = $scope.startsAt;
            $rootScope.currentSchedule.endsAt = $scope.endsAt;
            $rootScope.currentSchedule.displayElements = [];
            $rootScope.currentSchedule.leType = $rootScope.leType;
            $rootScope.currentSchedule.layoutElement = $rootScope.layoutElement;
            $rootScope.currentSchedule.recursOn = $scope.recursOn;
            $rootScope.currentSchedule.recDetail = $scope.recDetail;
            $rootScope.currentSchedule.recRange = $scope.recRange;
            $rootScope.currentSchedule.network = $rootScope.selectedNetwork.id;
            $rootScope.currentSchedule.assetType = 'Schedule';
        
            if ($scope.recurrence.enabled) {
                $rootScope.currentSchedule.recurrence = $scope.recurrence;
            }
            
            for (var i=0; i < $scope.displayElements.length; i++) {
                $rootScope.currentSchedule.displayElements.push($scope.displayElements[i].id);
            }
            console.log('saving schedule : '+$rootScope.currentSchedule.startDate);
            var url = '/dsn/saveSchedule'; 
            if ($rootScope.currentSchedule.id) {
                url+='?sid='+$rootScope.currentSchedule.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentSchedule,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
    //            callback(response);
                console.log('saveSchedule returned response : '+response);
                $scope.closeThisDialog();
                // refresh layouts on page
//                $scope.getLayouts();
            });    
        }
        
        $scope.selectedDisplayElements = function() {
            var length = $scope.displayElements.length;
            //console.log("selectedDisplayElements : "+length);
            var result = "";
            if (length == 0) {
                return "Nothing selected";
            } else if (length > 3) {
                var total = $scope.displaygroups.length+$scope.displays.length;
                result += $scope.displayElements.length+" out of "+total;
                return result;
            } else {
                var i = 0;
                result += $scope.displayElements[i].name;
//                console.log("selectedDisplayElements , result : "+result);
                for (i=1; i < length; i++) {
                    result = result+",";
                    result = result+$scope.displayElements[i].name;
                }
                console.log("selectedDisplayElements , result : "+result);
                return result;
            }
        }
    
        $scope.hasDisplay = function(collection, id) {
            console.log("hasDisplay , comparing :  "+id+" to : , "+collection);
            var result = false;
            for (var i=0; i < collection.length; i++) {
                var did = collection[i];
                if (did == id) {
                    console.log("returning true, id : "+id+" , display.id : "+did);
                    result = true;
                    break;
                }
                console.log("returning false");
            }
            return result;
        }

        $scope.getWheels = function() {
           var url = '/dsn/wheels?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
               .then(function(res){
                  $rootScope.wheels = res.data;                
            });
        }
        
        $scope.getDisplays = function() {
           var url = '/dsn/displays?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
               .then(function(res){
                  $scope.displays = res.data;                
            });
        }

        $scope.getDisplayGroups = function() {
           var url = '/dsn/displaygroups?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
               .then(function(res){
                  $scope.displaygroups = res.data;                
            });
        }

        $scope.updateDefaultLayout = function() {
            console.log("updateDefaultLayout() selectedLayout : "+$scope.selectedLayout);
//            $scope.selectedLayout = layout;
            if ($scope.selectedLayout) {
                console.log("setting defaultLayout");
                $scope.currentDisplay.defaultLayout = $scope.selectedLayout.id;
            }
        }
        
        $scope.showStart = function() {
            console.log("startAt : "+$scope.startAt.toString());
        }
        
        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.open = function() {
            $scope.popup.opened = true;
        };


        $scope.popup = {
            opened: false
        };



        $scope.dateChange = function() { 
            $scope.initTimePicker($scope.dt);
        }

        $scope.toggleStartDate = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.startDateOpened = !($scope.startDateOpened);
            console.log('toggleStartDate() : '+$scope.startDateOpened );
        }
        
        $scope.toggleStartsAt = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.startsAtOpened = !($scope.startsAtOpened);
            console.log('toggleStartsAt() : '+$scope.startsAt );
        }

        $scope.toggleEndsAt = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.endsAtOpened = !($scope.endsAtOpened);
            console.log('toggleStartsAt() : '+$scope.endsAt );
        }

        $scope.getDateOnly = function(d) {
            return d.format('MM DD YYY');
        }

        $scope.getTimeOnly = function(d) {
            return d.format('h : mm a');
        }

        
        $scope.addLayoutEntry = function(layout) {
            console.log("this would add layout entry to currentWheel :"+layout.name+" , "+$scope.currentWheel);
            if (!$rootScope.currentWheel.layouts) {
                $rootScope.currentWheel.layouts = [];
            }
            $rootScope.currentWheel.layouts.push(layout);
        }
        $scope.removeLayoutEntry = function(index) {
            console.log("this would remove layout entry from currentWheel, index :"+index+" , "+$scope.currentWheel);
            $scope.currentWheel.layouts.splice(index, 1);
        }
        $scope.whatsUp = function() {
            console.log('WheelDialogController scope : '+$rootScope.currentWheel);
        }
        $scope.saveWheel = function() {
            console.log('saving wheel : '+$rootScope.currentWheel);
            $rootScope.currentWheel.assetType = 'Wheel';
            $rootScope.currentWheel.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveWheel'; 
            if ($rootScope.currentWheel.id) {
                url+='?lid='+$rootScope.currentWheel.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentWheel,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
    //            callback(response);
                console.log('currentWheel returned response : '+response);
                // refresh layouts on page
//                $scope.getLayouts();
            });    

        }
        $scope.saveDisplay = function() {
            console.log('saving display : '+$rootScope.currentDisplay);
            $rootScope.currentDisplay.network = $rootScope.selectedNetwork.id;
            var url = '/dsn/saveDisplay'; 
            if ($rootScope.currentDisplay.id) {
                url+='?did='+$rootScope.currentDisplay.id;
            }
            $http({
                url: url,
                method: "POST",
                data: $rootScope.currentDisplay,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
                console.log('currentWheel returned response : '+response);
            });    

        }
        
         $scope.dateTimeNow = function() {
    $scope.date = new Date();
  };
  $scope.dateTimeNow();
  
  $scope.toggleMinDate = function() {
    var minDate = new Date();
    // set to yesterday
    minDate.setDate(minDate.getDate() - 1);
    $scope.dateOptions.minDate = $scope.dateOptions.minDate ? null : minDate;
  };
   
  $scope.dateOptions = {
    showWeeks: false,
    startingDay: 0
  };
  
    // Disable weekend selection
   $scope.isDisabledDate = function(currentDate, mode) {
       return mode === 'day' && (currentDate.getDay() === 0 || currentDate.getDay() === 6);
   };    
  $scope.toggleMinDate();
  
  // Disable weekend selection
  $scope.disabled = function(calendarDate, mode) {
    return mode === 'day' && ( calendarDate.getDay() === 0 || calendarDate.getDay() === 6 );
  };
  
  $scope.open = function($event,opened) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.startDateOpened = true;
  };

//  $scope.startDateOpened = false;
  $scope.hourStep = 1;
  // $scope.format = "dd-MMM-yyyy";
  $scope.format = "h : mm a";
  $scope.minuteStep = 15;

  $scope.timeOptions = {
    hourStep: [1, 2, 3],
    minuteStep: [1, 5, 10, 15, 25, 30]
  };

  $scope.showMeridian = true;
  $scope.timeToggleMode = function() {
    $scope.showMeridian = !$scope.showMeridian;
  };
  
  $scope.$watch("date", function(date) {
    // read date value
  }, true);
  
  $scope.resetHours = function() {
    $scope.date.setHours(1);
  };

})
.controller("ImageCropperCtrl",[ '$scope', function($scope) 
{
        $scope.cropper = {};
        $scope.cropper.sourceImage = null;
        $scope.cropper.croppedImage = null;
        $scope.bounds = {};
        $scope.bounds.left = 0;
        $scope.bounds.right = 0;
        $scope.bounds.top = 0;
        $scope.bounds.bottom = 0;
}])
//.controller('LocationController', [ '$scope', 'leafletData', function($window, $scope, leafletData) {
.controller('MapController', [ '$scope', '$rootScope', 'leafletData', function($scope, $rootScope, leafletData, $window) {
    $scope.mapReady = false;
    $scope.dialogHeight = { "height" : "640px" };
    $rootScope.currentLocation = {};
    $scope.position;
    
    $scope.setLatLon = function(ll, zoom) {
        console.log('lat lon : '+ll);
        console.log('setLatLon - currentProduct : '+JSON.stringify($rootScope.currentLocation));
        $rootScope.currentLocation.lat = ll.lat;
        $rootScope.currentLocation.lon = ll.lng;
        
        var imagerySet = "Road"; //AerialWithLabels
        var dim = "400,400";
//        var zoom=12;
        var centerPoint = ll.lat+","+ll.lng;
        var BingMapKey = 'AkJeLZ15t82hZ0HbdI-VRxNxH4YTAMqt_38zym2yt8_zRrfbO-oF4FNnfV3x4jTo';
        var murl =  "http://dev.virtualearth.net/REST/v1/Imagery/Map/"+imagerySet+"/"+centerPoint+"/"+zoom+"?mapSize=400,400&pp="+centerPoint+"&key="+BingMapKey;

        if (!$rootScope.currentLocation.mapImage) {
            $rootScope.currentLocation.mapImage = {};
        }
        $rootScope.currentLocation.mapImage.src = murl;
    }
//    $scope.ngDialogStyle = function() {
//        console.log('ngDialogStyle')
//        var style = "'height' : '"+NGDIALOG_MAX_SIZE+"'";
//        return style;
//    }

//    angular.extend($scope, {
//        center: {
//            lat: 46.505,
//            lng: -122.09,
//            zoom: 5
//        }
//    });
//    $scope.refreshMap = function() {
//        leafletData.getMap('map').then(function(map) {
////            map.zoomIn(1);
////            map.remove();
//            console.log('refreshing map');
//            $scope.showMap = !$scope.showMap;
//            if ($scope.showMap) {
//                map.invalidateSize(false);
//            }
////            map.setView();
////            map.invalidateSize(true);
////            map.zoomOut(1);
//        });
//    }

//    leafletData.getMap('map').then(function(map) {
//       $scope.map = map;
////       setTimeout(function(){
//////             map.invalidateSize(false);
//////             console.log('getMap() invalidating size.');
////        }, 1000);
//    });
    $scope.mapLoaded = function() {
        console.log('mapLoaded called.');
        setTimeout(function(){
            initMap();
        }, 200);
    }
//    angular.element(document).ready(function () {
//        initComponents();
//        initMap();
//    });
}])
.controller('LocationController', function($rootScope, $http, $window, $scope) {
    
            $scope.loadPage = function() {
        //         angular.element(document).ready(function () {
                console.log('pageLoaded()...');
                setTimeout(function(){
//                   map.invalidateSize(false);
//                   console.log('getMap() invalidating size.');
//                    $window.initMap();
                }, 200);

        //         });
            };

            $scope.mapTest = function (){
                console.log('mapTest : ');
            }

//            var mainMarker = {
//                lat: 47.6262,
//                lng: -122.5212,
//                focus: true,
//                message: "Drag to set location",
//                draggable: true
//            };

//            angular.extend($scope, {
//                bainbridge: {
//                    lat: 47.6262,
//                    lng: -122.5212,
//                    zoom: 8
//                },
//                markers: {
//                    mainMarker: angular.copy(mainMarker)
//                },
//                center: {
//                    lat: 47.6262,
//                    lng: -122.5212,
//                    zoom: 8
//                },
//                position: {
//                    lat: 47.6262,
//                    lng: -122.5212
//                },
//                events: { // or just {} //all events
//                    markers:{
//                      enable: [ 'dragend' ]
//                      //logic: 'emit'
//                    }
//                }
//            });

//            $scope.$on("leafletDirectiveMarker.dragend", function(event, args){
//                $scope.position.lat = args.model.lat;
//                $scope.position.lng = args.model.lng;
//            });
//            leafletData.getMap('map').then(function(map) {
////                $timeout(function() {map.invalidateSize()});
////                map.invalidateSize(false);
//                setTimeout(function(){
//                   map.invalidateSize(false);
//                   console.log('getMap() invalidating size.');
//                }, 200);
//                
//            });

    
})
.controller('CSVImportController',['$rootScope', '$scope', '$http', '$timeout', '$compile', '$parse', function ($rootScope, $scope, $http, $timeout, $compile, $parse) {
   
     $scope.csv = {
    	acontent: null,
    	agcontent: null,
    	fcontent: null,
    	fgcontent: null,
    	pcontent: null,
    	pgcontent: null,
    	header: true,
    	headerVisible: false,
    	separator: ',',
    	separatorVisible: false,
    	result: null,
    	encoding: 'UTF-8',
    	encodingVisible: false,
    }
     
//    	encoding: 'ISO-8859-1',
     /* products */
    // watch for product group content
    $scope.$watch('csv.pgcontent', function() {
        var obj = null;
        try {
            obj = CSVToArray($scope.csv.pgcontent,',');
            console.log('parsing product group complete : '+obj[0]);
            if (!$rootScope.productGroups) {
                $rootScope.productGroups = [];
            }
            //  TODO : ideally get the names and indexes of those names from the 1st row of data.
            //         Then use that name/index array to parse the rest of the CSV data to create products and productGroups,
            //         but for now, use the 1st field as a name and the 2nd field as a category
            
            var length = obj.length;
            for (var i=1; i < length; i++) {
                var record = obj[i];
                console.log('product content : '+JSON.stringify(record));
                var name = obj[i][CSV_PG_NAME];
                var pg = oForName($rootScope.productGroups, name);
                if (!pg) {
                    pg = {};
                    pg.path = '/data/assets/';
                    $rootScope.productGroups.push(pg);
                }
                pg.name = name;
                var category = obj[i][CSV_PG_CATEGORY];
                pg.category = category;
                pg.items = [];
                var nReplaced = name.trim().replace(/\s/g, '_');
                nReplaced = nReplaced.replace(/\//g, '_');
                nReplaced = nReplaced.replace(/__/g, '_');
                pg.path += nReplaced.toLowerCase();
                var location = obj[i][CSV_PG_LOCATION];
                var description = obj[i][CSV_PG_DESC];
                var details = obj[i][CSV_PG_DETAILS];
                var timezone = obj[i][CSV_PG_TZ];
                var language = obj[i][CSV_PG_LANGUAGE];
                var currency = obj[i][CSV_PG_CURRENCY];
                var features = obj[i][CSV_PG_FEATURES];
                
                pg.major = category;
                pg.minor = name;
                console.log('PG setting major : '+pg.major);
                pg.location = location;
                pg.description = description;
                pg.details = details;
                pg.timezone = timezone;
                pg.language = language;
                pg.currency = currency;
                pg.features = features;
                pg.assetType = 'ProductGroup';
                $scope.saveProductGroup(pg);

            }
        } catch(e){
            // eat $parse error
            // walk this thing and import 
            console.log('parse error : '+e);
        }
    });

    // watch for product content
    $scope.$watch('csv.pcontent', function() {
        var obj = null;
        try {
            obj = CSVToArray($scope.csv.pcontent,',');
            console.log('parsing product complete : '+obj[0]);
            if (!$rootScope.products) {
                $rootScope.products = [];
            }
            if (!$rootScope.productGroups) {
                $rootScope.productGroups = [];
            }
            //  TODO : ideally get the names and indexes of those names from the 1st row of data.
            //         Then use that name/index array to parse the rest of the CSV data to create products and productGroups,
            //         but for now, use the 1st field as a name and the 2nd field as a category
            var itemsLength = obj.length;
            console.log('pcontent watch , length : '+length);
            var itemsProcessed = 0;
            for (var pidx=1; pidx < itemsLength; pidx++) {
                
                var name = obj[pidx][CSV_P_PGNAME];
                var pg = oForName($rootScope.productGroups, name);
                if (!pg) {
                    pg = {};
                    pg.name = name;
                    pg.items = [];
                    pg.path = '/data/assets/';
                    $rootScope.productGroups.push(pg);
                    var nReplaced = name.trim().replace(/\s/g, '_');
                    nReplaced = nReplaced.replace(/\//g, '_');
                    nReplaced = nReplaced.replace(/__/g, '_');
                    pg.path += nReplaced.toLowerCase();
                    console.log('setting pg path : '+pg.path);
                }
                var p = {};
                var path = pg.path;
                var image = obj[pidx][CSV_P_IMAGE];
                // thumb is not really anything yet
//                var thumb = obj[i][CSV_P_THUMB];
                var description = obj[pidx][CSV_P_DESC];
                var location = obj[pidx][CSV_P_LOCATION];
                // anything in features column?
                var featured = obj[pidx][CSV_P_FEATURED];
                p.image = {};
                p.image.src = path+"/"+image.toLowerCase();
                
                p.description = description;
                p.location = location;
                p.productIndex = pidx;
                p.assetType = 'Product';
                if (featured) {
                    p.featured = featured;
                }
                pg.items.push(p);
                if (pidx + 1 < pidx && pidx % 100 == 0) {
                    setTimeout(process, 5);
                }
                // save asset here, get the asset id and save it in the item
                $scope.saveProduct(p, function(response) {
//                    console.log('saveProduct for index : '+p.productIndex+' , returned : '+response);
//                    pg.items.push(response);
//                    p.id = response.id;
                    itemsProcessed++;
                    if (itemsProcessed == (itemsLength-1)) {
                        console.log("saving all ProductGroups : ");
                        var glength = $rootScope.productGroups.length;
                        for (var i=0; i < glength; i++) {
                            var _pg = $rootScope.productGroups[i];
                            $scope.saveProductGroup(_pg);
                        }
                    }
                });

            }
//            length = $rootScope.productGroups.length;
//            for (var i=1; i < length; i++) {
//                var pg = $rootScope.productGroups[i];
//            $scope.saveProductGroup(pg);
//            }
        } catch(e){
            // eat $parse error
            // walk this thing and import 
            console.log('parse error : '+e);
        }
    });

//    $scope.saveAsset = function(a) {
//        
//        var url = '/dsn/saveAsset'; 
//        if (a.id) {
//            url+='?aid='+a.id;
//        }
//        a.network = $rootScope.selectedNetwork.id;
//        $http({
//            url: url,
//            method: "POST",
//            data: a,
//            headers: {'Content-Type': "application/json" }
//        }).success(function (response) {
////            callback(response);
//            console.log('saveProduct returned response : '+JSON.stringify(response));
//            var id = response.id;
//            a.id = id;
//        });    
//        
//    }
    
    $scope.saveProduct = function(p, callback) {
        
        var url = '/dsn/saveProduct'; 
        if (p.id) {
            url+='?pid='+p.id;
        }
        p.network = $rootScope.selectedNetwork.id;
        $http({
            url: url,
            method: "POST",
            data: p,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            var id = response.id;
            console.log('saveProduct returned response, id : '+response.id);
            p.id = id;
            callback(p);
        });    
        
    }

    $scope.saveProductGroup = function(pg) {
        
        var url = '/dsn/saveProductGroup'; 
        if (pg.id) {
            url+='?gid='+pg.id;
        }
        pg.network = $rootScope.selectedNetwork.id;
        $http({
            url: url,
            method: "POST",
            data: pg,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            pg.id = response.id;
            console.log('saveProductGroup returned response, id : '+response.id);
//            var id = response.id;
//            console.log('saveProductGroup returned response, id : '+id);
//            pg.id = id;
//            callback(response);
        });    
        
    }

    $scope.getProducts = function() {
           $rootScope.products = {};                
           var url = '/dsn/products?nid='+encodeURIComponent($rootScope.selectedNetwork.id);
           $http.get(url)
           .then(function(res){
              $rootScope.products = res.data;                
        });
    }

    $scope.getProductGroups = function() {
           $rootScope.productGroups = {};                
           var url = '/dsn/productGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
           $http.get(url)
           .then(function(res){
              $rootScope.productGroups = res.data;                
        });
    }

    /* announcements */
    
    // watch for product group content
    $scope.$watch('csv.agcontent', function() {
        
        var obj = null;
        try {
            obj = CSVToArray($scope.csv.agcontent,',');
            console.log('parsing announcement group complete : '+obj[0]);
            if (!$rootScope.announcementGroups) {
                $rootScope.announcementGroups = [];
            }
            //  TODO : ideally get the names and indexes of those names from the 1st row of data.
            //         Then use that name/index array to parse the rest of the CSV data to create products and productGroups,
            //         but for now, use the 1st field as a name and the 2nd field as a category
            
            
            //Name	image	Location	Description	Tag	Details	Features	
            
            var length = obj.length;
            for (var i=1; i < length; i++) {
                var record = obj[i];
                console.log('product content : '+JSON.stringify(record));
                var name = obj[i][CSV_AG_NAME].trim();
                var ag = oForName($rootScope.announcementGroups, name);
                if (!ag) {
                    ag = {};
                    ag.name = name;
                    ag.items = [];
                    ag.image = {};
                    ag.path = '/data/assets/';
                    var nReplaced = name.replace(/\s/g, '_');
                    nReplaced = nReplaced.replace(/\//g, '_');
                    nReplaced = nReplaced.replace(/__/g, '_');
                    ag.path += nReplaced.toLowerCase();
                    console.log('setting ag path : '+ag.path);
                    $rootScope.announcementGroups.push(ag);
                }
                var image = obj[i][CSV_AG_IMAGE];
                if (image) {
                    ag.image.src = ag.path+"/"+image.toLowerCase();
                }
                ag.location = obj[i][CSV_AG_LOCATION];
                ag.description = obj[i][CSV_AG_DESC];
                ag.tags = obj[i][CSV_AG_TAGS];
                ag.details = obj[i][CSV_AG_DETAILS];
                ag.features = obj[i][CSV_AG_FEATURES];
                ag.assetType = 'AnnouncementGroup';
                $scope.saveAnnouncementGroup(ag);

            }
        } catch(e){
            // eat $parse error
            // walk this thing and import 
            console.log('parse error : '+e);
        }
    });

    // watch for product content
    $scope.$watch('csv.acontent', function() {
        var obj = null;
        try {
            obj = CSVToArray($scope.csv.acontent,',');
            console.log('parsing announcement complete : '+obj[0]);
            if (!$rootScope.announcements) {
                $rootScope.announcements = [];
            }
            if (!$rootScope.announcementGroups) {
                $rootScope.announcementGroups = [];
            }
            //  TODO : ideally get the names and indexes of those names from the 1st row of data.
            //         Then use that name/index array to parse the rest of the CSV data to create products and productGroups,
            //         but for now, use the 1st field as a name and the 2nd field as a category
            var length = obj.length;
            var itemsProcessed = 0;
            for (var aidx=1; aidx < length; aidx++) {

//                Name	image	Latitude, Longitude	Short Description	Tag	Detailed Description	Features
                var gname = obj[aidx][CSV_A_CATEGORY].trim();
                var ag = oForName($rootScope.announcementGroups, gname);
                if (!ag) {
                    ag = {};
                    ag.name = gname;
                    ag.items = [];
                    ag.path = '/data/assets/';
                    var nReplaced = name.replace(/\s/g, '_');
                    nReplaced = nReplaced.replace(/\//g, '_');
                    nReplaced = nReplaced.replace(/__/g, '_');
                    ag.path += nReplaced.toLowerCase();
                    console.log('setting ag path : '+ag.path);
                    $rootScope.announcementGroups.push(ag);
                }
                var a = {};
                a.name = obj[aidx][CSV_A_NAME];
                a.category = gname;
                a.path = ag.path;
                var image = obj[aidx][CSV_A_IMAGE];
                a.image = {};
                if (image) {
                    a.image.src = ag.path+'/'+image.toLowerCase();
                }
                a.description = obj[aidx][CSV_A_DESC];
                a.details = obj[aidx][CSV_A_DETAILS];
                a.location = obj[aidx][CSV_A_LOCATION];
                a.featured = obj[aidx][CSV_A_FEATURED];
                a.price = obj[aidx][CSV_A_PRICE];
                
                a.features = obj[aidx][CSV_A_FEATURES];
                a.icon = obj[aidx][CSV_A_ICON];
                a.scanCode = obj[aidx][CSV_A_SCANCODE];
                a.tags = obj[aidx][CSV_A_TAGS];
                a.assetType = 'Announcement';
                ag.items.push(a);
                if (aidx + 1 < aidx && aidx % 100 == 0) {
                    setTimeout(process, 5);
                }
                console.log('calling saveAnnouncement, group : '+ag);
                $scope.saveAnnouncement(a, function(response) {
//                    ag.items.push(a);
//                    console.log("saveAnnouncement response : "+ag.items.length );
                    itemsProcessed++;
                    console.log("save announcement response : "+itemsProcessed+" , "+length+" , "+ag);
                    
//                    console.log('saveProduct for index : '+p.productIndex+' , returned : '+response);
//                    pg.items.push(response);
//                    p.id = response.id;
                    if (itemsProcessed == (length-1)) {
                        // is it the last item?
                        console.log("saving all AnnouncementGroups : ");
//                        $scope.saveAnnouncementGroup(ag);
//                    if (p.productIndex == length-1) {
//                        // this was the last one
//                        console.log('saving productGroup : '+name);
//                        $scope.saveProductGroup(pg);    
                        var glength = $rootScope.announcementGroups.length;
                        for (var i=0; i < glength; i++) {
                            var _ag = $rootScope.announcementGroups[i];
                            $scope.saveAnnouncementGroup(_ag);
                        }
                    }
                });
                
                
                
            }
//            length = $rootScope.announcementGroups.length;
//            for (var i=1; i < length; i++) {
//                var ag = $rootScope.announcementGroups[i];
//                $scope.saveAnnouncementGroup(ag);
//            }
        } catch(e){
            // eat $parse error
            // walk this thing and import 
            console.log('parse error : '+e);
        }
    });

    
    $scope.saveAnnouncement = function(a, callback) {
        
        var url = '/dsn/saveAnnouncement'; 
        if (a.id) {
            url+='?pid='+a.id;
        }
        a.network = $rootScope.selectedNetwork.id;
        $http({
            url: url,
            method: "POST",
            data: a,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveAnnouncement returned response : '+response.id);
            var id = response.id;
            a.id = id;
            callback(response);
        });    
        
    }

    $scope.saveAnnouncementGroup = function(ag) {
        
        var url = '/dsn/saveAnnouncementGroup'; 
        if (ag.id) {
            url+='?gid='+ag.id;
        }
        ag.network = $rootScope.selectedNetwork.id;
        console.log('saveAnnouncementGroup : '+JSON.stringify(ag));
        $http({
            url: url,
            method: "POST",
            data: ag,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveAnnouncementGroup returned response : '+JSON.stringify(response));
            var id = response.id;
            ag.id = id;
//            callback(ag);
        });    
        
    }

    $scope.getAnnouncements = function() {
           $rootScope.announcements = {};                
           var url = '/dsn/announcements?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
           $http.get(url)
           .then(function(res){
              $rootScope.announcements = res.data;                
        });
    }

    $scope.getAnnouncementGroups = function() {
           $rootScope.announcementGroups = {};                
           var url = '/dsn/announcementGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
           $http.get(url)
           .then(function(res){
              $rootScope.announcementGroups = res.data;                
        });
    }
    
    
    
    
    
    /* feeds */
    
    // watch for product group content
    $scope.$watch('csv.fgcontent', function() {
        var obj = null;
        try {
            obj = CSVToArray($scope.csv.pgcontent,',');
            console.log('parsing product group complete : '+obj[0]);
            if (!$rootScope.productGroups) {
                $rootScope.productGroups = [];
            }
            //  TODO : ideally get the names and indexes of those names from the 1st row of data.
            //         Then use that name/index array to parse the rest of the CSV data to create products and productGroups,
            //         but for now, use the 1st field as a name and the 2nd field as a category
            
            var length = obj.length;
            for (var i=1; i < length; i++) {
                var record = obj[i];
                console.log('product content : '+JSON.stringify(record));
                var name = obj[i][CSV_PG_NAME];
                var pg = oForName($rootScope.productGroups, name);
                if (!pg) {
                    pg = {};
                    pg.path = '/data/assets/';
                    $rootScope.productGroups.push(pg);
                }
                pg.name = name;
                var category = obj[i][CSV_PG_CATEGORY];
                pg.category = category;
                pg.items = [];
                var nReplaced = name.replace(/\s/g, '_');
                nReplaced = nReplaced.replace(/\//g, '_');
                nReplaced = nReplaced.replace(/__/g, '_');
                pg.path += nReplaced.toLowerCase();
                var location = obj[i][CSV_PG_LOCATION];
                var description = obj[i][CSV_PG_DESC];
                var details = obj[i][CSV_PG_DETAILS];
                var timezone = obj[i][CSV_PG_TZ];
                var language = obj[i][CSV_PG_LANGUAGE];
                var currency = obj[i][CSV_PG_CURRENCY];
                var features = obj[i][CSV_PG_FEATURES];
                
                pg.location = location;
                pg.description = description;
                pg.details = details;
                pg.timezone = timezone;
                pg.language = language;
                pg.currency = currency;
                pg.features = features;
                $scope.saveProductGroup(pg);

            }
        } catch(e){
            // eat $parse error
            // walk this thing and import 
            console.log('parse error : '+e);
        }
    });

    // watch for product content
    $scope.$watch('csv.fcontent', function() {
        var obj = null;
        try {
            obj = CSVToArray($scope.csv.pcontent,',');
            console.log('parsing product complete : '+obj[0]);
            if (!$rootScope.products) {
                $rootScope.products = [];
            }
            //  TODO : ideally get the names and indexes of those names from the 1st row of data.
            //         Then use that name/index array to parse the rest of the CSV data to create products and productGroups,
            //         but for now, use the 1st field as a name and the 2nd field as a category
            var length = obj.length;
            for (var i=1; i < length; i++) {
                
                var name = obj[i][CSV_P_PGNAME];
                var pg = oForName($rootScope.feedGroups, name);
                if (!pg) {
                    pg = {};
                    pg.name = name;
                    pg.items = [];
                    pg.path = '/data/assets/';
                    $rootScope.feedGroups.push(pg);
                    var nReplaced = name.replace(/\s/g, '_');
                    nReplaced = nReplaced.replace(/\//g, '_');
                    nReplaced = nReplaced.replace(/__/g, '_');
                    pg.path += nReplaced.toLowerCase();
                    console.log('setting pg path : '+pg.path);
                }
                var p = {};
                var path = pg.path;
                var image = obj[i][CSV_P_IMAGE];
                // thumb is not really anything yet
//                var thumb = obj[i][CSV_P_THUMB];
                var description = obj[i][CSV_P_DESC];
                var location = obj[i][CSV_P_LOCATION];
                // anything in features column?
                var featured = obj[i][CSV_P_FEATURED];
                p.image = {};
                p.image.src = path+"/"+image.toLowerCase();
                p.description = description;
                p.location = location;
                if (featured) {
                    p.featured = featured;
                }
                pg.items.push(p);
                $scope.saveFeed(p);

            }
            length = $rootScope.feedGroups.length;
            for (var i=1; i < length; i++) {
                var pg = $rootScope.feedGroups[i];
                $scope.saveFeedGroup(pg);
            }
        } catch(e){
            // eat $parse error
            // walk this thing and import 
            console.log('parse error : '+e);
        }
    });

    
    $scope.saveFeed = function(f) {
        
        var url = '/dsn/saveFeed'; 
        if (f.id) {
            url+='?pid='+f.id;
        }
        f.network = $rootScope.selectedNetwork.id;
        $http({
            url: url,
            method: "POST",
            data: f,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveFeed returned response : '+JSON.stringify(response));
            var id = response.id;
            f.id = id;
        });    
        
    }

    $scope.saveFeedGroup = function(fg) {
        
        var url = '/dsn/saveFeedGroup'; 
        if (fg.id) {
            url+='?gid='+fg.id;
        }
        fg.network = $rootScope.selectedNetwork.id;
        $http({
            url: url,
            method: "POST",
            data: fg,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
//            callback(response);
            console.log('saveFeedGroup returned response : '+JSON.stringify(response));
            var id = response.id;
            fg.id = id;
        });    
        
    }

    $scope.getFeeds = function() {
           $rootScope.products = {};                
           var url = '/dsn/feeds?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
           $http.get(url)
           .then(function(res){
              $rootScope.feeds = res.data;                
        });
    }

    $scope.getFeedGroups = function() {
           $rootScope.productGroups = {};                
           var url = '/dsn/feedGroups?nid='+encodeURIComponent($rootScope.selectedNetwork.id); 
           $http.get(url)
           .then(function(res){
              $rootScope.feedGroups = res.data;                
        });
    }
    
    $scope.initialize = function() {
        console.log('CSVImportController.initialize()');
        $scope.getProductGroups();
        $scope.getProducts();
        $scope.getAnnouncementGroups();
        $scope.getAnnouncements();
        $scope.getFeedGroups();
        $scope.getFeeds();
        
    }
}])
.controller("CompanyDialogController", function ($scope, $rootScope, $http, ngDialog, $controller, AssetSvc, CService, $filter) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
        $scope.media = [];
        $scope.currentCompany = 0;
        $scope.numRegions = 0;
        $scope.layoutTitle = 'Add Layout';
    
        $scope.getBackgroundImage = function(image) {
            console.log('getBackgroundImage : '+image)
            if (image == 'portrait') {
                return $scope.backgroundImagePortrait.path;
            }
            if (image == 'landscape') {
                return $scope.backgroundImageLandscape.path;
            }
            console.log('showLibrary : '+id);
        }

//        $scope.showLibrary = function(id) {
//            console.log('showLibrary : '+id);
//        }

    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

    $scope.initialize = function() {
        
            $scope.getLayoutTemplates();
            $scope.getRuleTemplates();
        
            if ($rootScope.currentLayout) {
                
                var lo = $rootScope.currentLayout;
                if (lo.backgroundImageLandscape) {
                    console.log('setting backgroundLayoutImage : '+JSON.stringify(lo.backgroundImageLandscape));
                    $scope.backgroundImageLandscape = lo.backgroundImageLandscape;
                } else {
                    $scope.backgroundImageLandscape = { name: 'landscape', path:'/images/background.png', width:'1920', height:'1080' };
                }
                if (lo.backgroundImagePortrait) {
                    console.log('setting backgroundImagePortrait : '+JSON.stringify(lo.backgroundImagePortrait));
                    $scope.backgroundImagePortrait = lo.backgroundImagePortrait;
                } else {
                    $scope.backgroundImagePortrait = { name: 'portrait', path:'/images/background_portrait.png', width:'1080', height:'1920' };
                }
                
                
                console.log('initialize looking for template : '+$rootScope.currentLayout.template);
                // first get the layoutTemplates
                
               $http.get('/templates/LayoutTemplates2.json')
               .then(function(res){
                  $scope.layoutTemplates = res.data;                
                  console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
                    for (var i=0; i < $scope.layoutTemplates.length; i++) {
                        var lt = $scope.layoutTemplates[i] 
                        if (lt.name == $rootScope.currentLayout.template) {
                            console.log('initialize setting template to : '+lt);
                            $scope.layoutTemplate = lt;
                            $scope.numRegions = $rootScope.currentLayout.regions.length;
                            $scope.selectedRegion = $rootScope.currentLayout.regions[0];
//                            $scope.entries = $scope.selectedRegion.entries;
                            if (!$scope.selectedRegion.entries) {
                                $scope.selectedRegion.entries = [];
                            }
                            break;
                        }
                    }
                });

            } else {
                $scope.backgroundImageLandscape = { name: 'landscape', path:'/images/background.png', width:'1920', height:'1080' };
                $scope.backgroundImagePortrait = { name: 'portrait', path:'/images/background_portrait.png', width:'1080', height:'1920' };
                $scope.layoutTemplate = $scope.layoutTemplates[0];
            }
    }
    
    $scope.getSelectedImage = function(imgName) {
        if (imgName == 'portrait') {
            return $scope.backgroundImagePortrait;
        }
        if (imgName == 'landscape') {
           return $scope.backgroundLayoutImage; 
        }
    }
    
    $scope.assignImage = function () {
        // TODO : really for product, needs to be refactored
        console.log('assignImage, asset name : '+$rootScope.selectedAsset.name+' , imageName : '+$rootScope.imageName);
        var bgImage = {};
        bgImage.path = $rootScope.selectedAsset.path;
        bgImage.id = $rootScope.selectedAsset.id;
        bgImage.size = $rootScope.selectedAsset.size;
        bgImage.width = $rootScope.selectedAsset.width;
        bgImage.height = $rootScope.selectedAsset.height;
                    
        $rootScope.selectedAsset = '';
        $rootScope.selectedImage = '';
        console.log('assignImage : backgroundImage : '+JSON.stringify(bgImage));
//        $scope.saveLayout();
        $scope.closeThisDialog(bgImage);
    };

    $scope.saveLayout = function() {
        
        console.log('saving layout : '+JSON.stringify($rootScope.currentLayout));
        if (!$rootScope.currentLayout.regions) {
            $rootScope.currentLayout.regions = $scope.layoutTemplate.regions;
        }
        if ($scope.layoutTemplate) {
            $rootScope.currentLayout.width = $scope.layoutTemplate.width;
            $rootScope.currentLayout.height = $scope.layoutTemplate.height;
            $rootScope.currentLayout.template = $scope.layoutTemplate.name;
        }
        $rootScope.currentLayout.network = $rootScope.selectedNetwork.id;
        var url = '/dsn/saveLayout'; 
        if ($rootScope.currentLayout.id) {
            url+='?lid='+$rootScope.currentLayout.id;
        }
        $http({
            url: url,
            method: "POST",
            data: $rootScope.currentLayout,
            headers: {'Content-Type': "application/json" }
        }).success(function (response) {
            console.log('saveLayout returned response : '+response);
            $scope.closeThisDialog();
            $rootScope.currentLayout = null;
        });    
    }

    
    $scope.showLibrary = function(image, width, height, min) {
        console.log('showLibrary - setting imageName : '+image+' , width : '+width+' , height : '+height+' , min : '+min);
        $rootScope.fixedWidth = parseInt(width);
        $rootScope.fixedHeight = parseInt(height);
        $rootScope.fixedMin = min;
        $rootScope.imageName = image;
        $rootScope.selectedImage = '';
        $rootScope.selectedImage = $scope.getSelectedImage(image);
        var modal = ngDialog.open({
            template: '/templates/dsn/popups/libraryPopup.html',
            showClose: false,
//            className: 'ngdialog-theme-plain custom-height',
            className: 'ngdialog-theme-default custom-height-600',
            controller: $controller('LayoutEditDialogController', {$scope: $scope})
            
        });
        
         // Wait for the dialog to close
         // When it closes, add to return value to the orders array
         modal.closePromise.then(function(res) {
             
             console.log('showLibrary close result : '+JSON.stringify(res));
             if (res) {
                if ($rootScope.imageName == 'portrait') {
                    console.log('showLibrary close setting portrait : '+JSON.stringify(res.value));
                    $scope.backgroundImagePortrait = res.value;
                    $rootScope.currentLayout.backgroundImagePortrait = res.value;
                }
                if ($rootScope.imageName == 'landscape') {
                    console.log('showLibrary close setting landscape : '+JSON.stringify(res.value));
                    $scope.backgroundImageLandscape = res.value;
                    $rootScope.currentLayout.backgroundImageLandscape = res.value;
                }
 
             }
         });
    }

    
    $scope.getMediaD = function(width, height, min) {
                $scope.media = [];
//                var minimum  = (min) ?  1 : 0;
                console.log('LayoutAssignController getMediaD : '+width+' , '+height+' , '+min);
                var url = '/dsn/media?nid='+$rootScope.selectedNetwork.id+'&width='+width+'&height='+height+'&min='+min;
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('getMedia search with type : '+$scope.selectedRegion);
                    url += '?type='+$scope.selectedRegion.name;
                }
               $http.get(url)
               .then(function(res){
                  console.log('getMedia results : '+res.data.length);
                  for (var idx=0; idx < res.data.length; idx++) {
                    var asset = res.data[idx];
                    asset.id = asset._id.toString();
                    delete asset._id;
                    $scope.media.push(asset);                
                  }
                  $scope.searchMedia();
             });
    }
    $scope.getMedia = function() {
                $scope.media = [];
                
                console.log('LayoutAssignController getMedia : '+JSON.stringify($rootScope.selectedNetwork));
                var url = '/dsn/media?nid='+$rootScope.selectedNetwork.id;
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('getMedia search with type : '+JSON.stringify($scope.selectedRegion));
                    if (!$scope.selectedRegion.name != 'content') {
                        url += '&type='+$scope.selectedRegion.name;
                    }
                }
               $http.get(url)
               .then(function(res){
                  console.log('getMedia results : '+res.data.length);
//                  for (var idx=0; idx < res.data.length; idx++) {
//                    var asset = res.data[idx];
//                    asset.id = asset._id.toString();
//                    delete asset._id;
//                    $scope.media.push(asset);                
//                  }
                  $scope.media = res.data;
//                  $scope.searchMedia();
             });
    }

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

              // init the filtered items
    $scope.searchMedia = function () {
//        console.log('searchMedia, query : '+$scope.query);
        
        $scope.filteredMedia = $filter('filter')($scope.media, function (item) {
//            for (var i=0; i < $scope.media.length; i++) {
//                
//            }
            for(var attr in item) {
//                console.log('searchMedia item : '+item.name);
//                if (searchMatch(item[attr], $scope.query)) {
                if (
                    
                    searchMatch(item.name, $scope.query) ||
                    searchMatch(item.description, $scope.query) ||
                    searchMatch(item.tags, $scope.query) ||
                    searchMatch(item.duration, $scope.query) 
                
                   ) {
//                    console.log('searchMedia returning true');
                    return true;
                }
            }
//            console.log('searchMedia returning false');
            return false;
        });
//        console.log('searchMedia Called '+$scope.filteredMedia.length);
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredMedia = $filter('orderBy')($scope.filteredMedia, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentPage = 1;
        // now group by pages
//        $scope.groupToPages();
        $scope.figureOutMediaToDisplay();
    };

        
    $scope.figureOutMediaToDisplay = function() {
        console.log('figureOutMediaToDisplay '+$scope.filteredMedia.length);
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var src = $scope.media;
        if ($scope.query) {
            if ($scope.filteredMedia && $scope.filteredMedia.length > 0) {
                src = $scope.filteredMedia;
                $scope.pages = src.slice(begin, end);
            } else {
                $scope.pages = [];
            }
        } else {
            $scope.pages = src.slice(begin, end);
        }
    };

//        $scope.selectedRegion = {};
        $scope.getMedia = function() {
                var url = '/dsn/media';
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    var searchName = $scope.selectedRegion.name.getText();
//                    console.log('searching media with type : '+searchName.toString());
//                    console.log('searchName is : '+(typeof searchName));
//                    if ("web" == searchName) {
//                        searchName = "text";
//                    }
                    url += '?type='+searchName;
                }
               $http.get(url)
               .then(function(res){
                  $scope.media = res.data; 
                  $scope.searchMedia();
            });
        }
        $scope.updateMediaList = function() {
                var url = '/dsn/media';
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('updateMediaList searching media with type : '+$scope.selectedRegion);
                    url += '?type='+$scope.selectedRegion.name;
                }
               $http.get(url)
               .then(function(res){
                  console.log('updateMediaList results : '+res.data.length);
                  $scope.media = res.data;                
            });
        }
        
        $scope.getLayoutTemplates = function() {
           $http.get('/templates/LayoutTemplates2.json')
           .then(function(res){
              $scope.layoutTemplates = res.data;                
              console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
            });
        }
        
        $scope.addMediaEntry = function(asset) {
            console.log("this would add entry to currentRegion :"+asset.name+" , "+$scope.selectedRegion.name);
            $scope.selectedRegion.entries.push(asset);
        }
        
        $scope.removeMediaEntry = function(index) {
            console.log("this would remove media entry from currentRegion, index :"+index+" , "+$scope.selectedRegion.name);
            $scope.selectedRegion.entries.splice(index, 1);
        }
        
        $scope.whatsUp = function() {
            console.log('LayoutEditDialogController scope : '+$rootScope.currentLayout);
        }
        

})
.controller('FilteredUpload', ['$scope', '$http', '$timeout', '$compile', 'Upload', function ($scope, $http, $timeout, $compile, Upload) {
    var version = 1.0;
  $scope.usingFlash = FileAPI && FileAPI.upload != null;
  //Upload.setDefaults({ngfKeep: true, ngfPattern:'image/*'});
  $scope.changeAngularVersion = function () {
    window.location.hash = $scope.angularVersion;
    window.location.reload(true);
  };
  $scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ?
    window.location.hash.substring(2) : window.location.hash.substring(1)) : '1.2.24';

  $scope.invalidFiles = [];

  $scope.$watch('files', function (files) {
    $scope.formUpload = false;
    if (files != null) {
      if (!angular.isArray(files)) {
        $timeout(function () {
          $scope.files = files = [files];
        });
        return;
      }
      for (var i = 0; i < files.length; i++) {
        Upload.imageDimensions(files[i]).then(function (d) {
          $scope.d = d;
        });
        $scope.errorMsg = null;
        (function (f) {
          $scope.upload(f, true);
        })(files[i]);
      }
    }
  });

  $scope.uploadPic = function (file) {
    $scope.formUpload = true;
    if (file != null) {
      $scope.upload(file);
    }
  };

  $scope.upload = function(file, resumable) {
    $scope.errorMsg = null;
    if ($scope.howToSend === 1) {
      uploadUsingUpload(file, resumable);
    } else if ($scope.howToSend == 2) {
      uploadUsing$http(file);
    } else {
      uploadS3(file);
    }
  };

  $scope.isResumeSupported = Upload.isResumeSupported();

  $scope.restart = function(file) {
    if (Upload.isResumeSupported()) {
      $http.get('https://angular-file-upload-cors-srv.appspot.com/upload?restart=true&name=' + encodeURIComponent(file.name)).then(function () {
        $scope.upload(file, true);
      });
    } else {
      $scope.upload(file);
    }
  };

  $scope.chunkSize = 100000;
  function uploadUsingUpload(file, resumable) {
    file.upload = Upload.upload({
      url: 'https://angular-file-upload-cors-srv.appspot.com/upload' + $scope.getReqParams(),
      resumeSizeUrl: resumable ? 'https://angular-file-upload-cors-srv.appspot.com/upload?name=' + encodeURIComponent(file.name) : null,
      resumeChunkSize: resumable ? $scope.chunkSize : null,
      headers: {
        'optional-header': 'header-value'
      },
      data: {username: $scope.username, file: file}
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });

    file.upload.xhr(function (xhr) {
      // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
    });
  }

  function uploadUsing$http(file) {
    file.upload = Upload.http({
      url: 'https://angular-file-upload-cors-srv.appspot.com/upload' + $scope.getReqParams(),
      method: 'POST',
      headers: {
        'Content-Type': file.type
      },
      data: file
    });

    file.upload.then(function (response) {
      file.result = response.data;
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    });

    file.upload.progress(function (evt) {
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  }

  function uploadS3(file) {
    file.upload = Upload.upload({
      url: $scope.s3url,
      method: 'POST',
      data: {
        key: file.name,
        AWSAccessKeyId: $scope.AWSAccessKeyId,
        acl: $scope.acl,
        policy: $scope.policy,
        signature: $scope.signature,
        'Content-Type': file.type === null || file.type === '' ? 'application/octet-stream' : file.type,
        filename: file.name,
        file: file
      }
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    });

    file.upload.progress(function (evt) {
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
    storeS3UploadConfigInLocalStore();
  }

  $scope.generateSignature = function () {
    $http.post('/s3sign?aws-secret-key=' + encodeURIComponent($scope.AWSSecretKey), $scope.jsonPolicy).
      success(function (data) {
        $scope.policy = data.policy;
        $scope.signature = data.signature;
      });
  };

  if (localStorage) {
    $scope.s3url = localStorage.getItem('s3url');
    $scope.AWSAccessKeyId = localStorage.getItem('AWSAccessKeyId');
    $scope.acl = localStorage.getItem('acl');
    $scope.success_action_redirect = localStorage.getItem('success_action_redirect');
    $scope.policy = localStorage.getItem('policy');
    $scope.signature = localStorage.getItem('signature');
  }

  $scope.success_action_redirect = $scope.success_action_redirect || window.location.protocol + '//' + window.location.host;
  $scope.jsonPolicy = $scope.jsonPolicy || '{\n  "expiration": "2020-01-01T00:00:00Z",\n  "conditions": [\n    {"bucket": "angular-file-upload"},\n    ["starts-with", "$key", ""],\n    {"acl": "private"},\n    ["starts-with", "$Content-Type", ""],\n    ["starts-with", "$filename", ""],\n    ["content-length-range", 0, 524288000]\n  ]\n}';
  $scope.acl = $scope.acl || 'private';

  function storeS3UploadConfigInLocalStore() {
    if ($scope.howToSend === 3 && localStorage) {
      localStorage.setItem('s3url', $scope.s3url);
      localStorage.setItem('AWSAccessKeyId', $scope.AWSAccessKeyId);
      localStorage.setItem('acl', $scope.acl);
      localStorage.setItem('success_action_redirect', $scope.success_action_redirect);
      localStorage.setItem('policy', $scope.policy);
      localStorage.setItem('signature', $scope.signature);
    }
  }

  function hasWidthAndHeight() {
        var element = document.getElementById("mapContainer");
        if (element) {  
            var positionInfo = element.getBoundingClientRect();
            var height = positionInfo.height;
            var width = positionInfo.width;

            if (mwidth != 0 && height != 0) {
                return true;
            }
        }
        return false;
      
  }
//  (function handleDynamicEditingOfScriptsAndHtml($scope) {
//    $scope.defaultHtml = document.getElementById('editArea').innerHTML.replace(/\t\t\t\t/g, '').replace(/&amp;/g, '&');
//
//    var fromLocal = (localStorage && localStorage.getItem('editHtml' + version));
//    $scope.editHtml = fromLocal || $scope.defaultHtml;
//    function htmlEdit() {
//      document.getElementById('editArea').innerHTML = $scope.editHtml;
//      $compile(document.getElementById('editArea'))($scope);
//      $scope.editHtml && localStorage && localStorage.setItem('editHtml' + version, $scope.editHtml);
//      if ($scope.editHtml != $scope.htmlEditor.getValue()) $scope.htmlEditor.setValue($scope.editHtml);
//    }
//
//    $scope.$watch('editHtml', htmlEdit);
//
//    $scope.htmlEditor = CodeMirror(document.getElementById('htmlEdit'), {
//      lineNumbers: true, indentUnit: 4,
//      mode: 'htmlmixed'
//    });
//    $scope.htmlEditor.on('change', function () {
//      if ($scope.editHtml != $scope.htmlEditor.getValue()) {
//        $scope.editHtml = $scope.htmlEditor.getValue();
//        htmlEdit();
//      }
//    });
//  })($scope, $http);

  $scope.confirm = function () {
    return confirm('Are you sure? Your local changes will be lost.');
  };

  $scope.getReqParams = function () {
    return $scope.generateErrorOnServer ? '?errorCode=' + $scope.serverErrorCode +
    '&errorMessage=' + $scope.serverErrorMsg : '';
  };

  angular.element(window).bind('dragover', function (e) {
    e.preventDefault();
  });
  angular.element(window).bind('drop', function (e) {
    e.preventDefault();
  });

  $scope.modelOptionsObj = {};
  $scope.$watch('validate+dragOverClass+modelOptions+resize+resizeIf', function (v) {
    $scope.validateObj = eval('(function(){return ' + $scope.validate + ';})()');
    $scope.dragOverClassObj = eval('(function(){return ' + $scope.dragOverClass + ';})()');
    $scope.modelOptionsObj = eval('(function(){return ' + $scope.modelOptions + ';})()');
    $scope.resizeObj = eval('(function($file){return ' + $scope.resize + ';})()');
    $scope.resizeIfFn = eval('(function(){var fn = function($file, $width, $height){return ' + $scope.resizeIf + ';};return fn;})()');
  });

  $timeout(function () {
    $scope.capture = localStorage.getItem('capture' + version) || 'camera';
    $scope.pattern = localStorage.getItem('pattern' + version) || 'image/*,audio/*,video/*';
    $scope.acceptSelect = localStorage.getItem('acceptSelect' + version) || 'image/*,audio/*,video/*';
    $scope.modelOptions = localStorage.getItem('modelOptions' + version) || '{debounce:100}';
    $scope.dragOverClass = localStorage.getItem('dragOverClass' + version) || '{accept:\'dragover\', reject:\'dragover-err\', pattern:\'image/*,audio/*,video/*,text/*\'}';
    $scope.disabled = localStorage.getItem('disabled' + version) == 'true' || false;
    $scope.multiple = localStorage.getItem('multiple' + version) == 'true' || false;
    $scope.allowDir = localStorage.getItem('allowDir' + version) == 'true' || true;
    $scope.validate = localStorage.getItem('validate' + version) || '{size: {max: \'20MB\', min: \'10B\'}, height: {max: 12000}, width: {max: 12000}, duration: {max: \'5m\'}}';
    $scope.keep = localStorage.getItem('keep' + version) == 'true' || false;
    $scope.keepDistinct = localStorage.getItem('keepDistinct' + version) == 'true' || false;
    $scope.orientation = localStorage.getItem('orientation' + version) == 'true' || false;
    $scope.resize = localStorage.getItem('resize' + version) || "{width: 1000, height: 1000, centerCrop: true}";
    $scope.resizeIf = localStorage.getItem('resizeIf' + version) || "$width > 5000 || $height > 5000";
    $scope.dimensions = localStorage.getItem('dimensions' + version) || "$width < 12000 || $height < 12000";
    $scope.duration = localStorage.getItem('duration' + version) || "$duration < 10000";
    $scope.$watch('validate+capture+pattern+acceptSelect+disabled+capture+multiple+allowDir+keep+orientation+' +
      'keepDistinct+modelOptions+dragOverClass+resize+resizeIf', function () {
      localStorage.setItem('capture' + version, $scope.capture);
      localStorage.setItem('pattern' + version, $scope.pattern);
      localStorage.setItem('acceptSelect' + version, $scope.acceptSelect);
      localStorage.setItem('disabled' + version, $scope.disabled);
      localStorage.setItem('multiple' + version, $scope.multiple);
      localStorage.setItem('allowDir' + version, $scope.allowDir);
      localStorage.setItem('validate' + version, $scope.validate);
      localStorage.setItem('keep' + version, $scope.keep);
      localStorage.setItem('orientation' + version, $scope.orientation);
      localStorage.setItem('keepDistinct' + version, $scope.keepDistinct);
      localStorage.setItem('dragOverClass' + version, $scope.dragOverClass);
      localStorage.setItem('modelOptions' + version, $scope.modelOptions);
      localStorage.setItem('resize' + version, $scope.resize);
      localStorage.setItem('resizeIf' + version, $scope.resizeIf);
    });
  });
}]);
