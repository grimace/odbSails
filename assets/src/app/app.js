const NETWORK = 0; 
const MOBILITY = 1;
const OBSERVATION = 2;
const MARKETABILITY = 3;
const STORE = 4;
const ABOUT = 5;

const SCHEDULE = 0;
const DESIGN = 1;
const LIBRARY = 2;
const DISPLAYS = 3;
const RULES = 4;

const LIST = 0; 
const EDIT = 1;
const CREATE = 2;
const LOCATE = 3;

const NGDIALOG_MAX_SIZE = '640px';


// PRODUCT CSV COLUMN DEFINITIONS
const CSV_PG_NAME	    = 0;
const CSV_PG_CATEGORY   = 1;
const CSV_PG_LOCATION   = 2;
const CSV_PG_DESC  	    = 3;
const CSV_PG_DETAILS	= 4;
const CSV_PG_TZ         = 5;
const CSV_PG_LANGUAGE	= 6;
const CSV_PG_CURRENCY	= 7;
const CSV_PG_FEATURES	= 8;

// PRODUCT CSV COLUMN DEFINITIONS
const CSV_P_PGNAME	    = 0;
const CSV_P_IMAGE	    = 1;
const CSV_P_THUMB   	= 2;
const CSV_P_DESC  	    = 3;
const CSV_P_LOCATION    = 4;
const CSV_P_FEATURED    = 5;


// ANNOUNCEMENT GROUP COLUMN DEFINITIONS
//Name	image	Latitude, Longitude	Description	Tag	Details	Features
const CSV_AG_NAME	    = 0;
const CSV_AG_IMAGE      = 1;
const CSV_AG_LOCATION   = 2;
const CSV_AG_DESC  	    = 3;
const CSV_AG_TAGS       = 4;
const CSV_AG_DETAILS	= 5;
const CSV_AG_FEATURES	= 6;


// ANNOUNCEMENT COLUMN DEFINITIONS
//Category	Image File Name	Product Name	Description	Details	lat /lon	Featured?	Price	Feature	Icon	scan code	TAG
const CSV_A_CATEGORY   = 0;
const CSV_A_IMAGE      = 1;
const CSV_A_NAME	   = 2;
const CSV_A_DESC  	   = 3;
const CSV_A_DETAILS	   = 4;
const CSV_A_LOCATION   = 5;
const CSV_A_FEATURED   = 6;
const CSV_A_PRICE  	   = 7;
const CSV_A_FEATURES   = 8;
const CSV_A_ICON   	   = 9;
const CSV_A_SCANCODE   = 10;
const CSV_A_TAGS   	   = 11;


angular.module( 'kombi', [
    'ui.router',
    'sails.io',
//    'ui.bootstrap.datetimepicker',
    'angularMoment',
    'lodash',
//    'angularMoment',
    'templates-app',
    'credit-cards',
    'services',
    'models',
    'leaflet-directive', 
    'mwl.calendar', 
//    'ui.bootstrap', 
//    'controllers',
//    'kombi.dsn_controllers',
//    'kombi.network_controllers',
    'kombi.login_controller',
    'fcsa-number', 
    'flow',
    'ngDialog',
    'ngFileUpload',
//    'wingify.timePicker',
//    'ngAnimate',
    'ui.bootstrap.datetimepicker',
//    'ui.timepicker',
    
    'kombi.header',
    'kombi.home',
    'kombi.network',
    'kombi.mobility',
    'kombi.observation',
    'kombi.marketability',
    'kombi.store',
    'kombi.about',
    'gg.editableText',
    'angular-img-cropper',
    'ngCsvImport',
//    'dirPagination'
    'angularUtils.directives.dirPagination',
    'ui.bootstrap',
    'ui.bootstrap.dateparser',
//    'timepickerPop'
    'sy.bootstrap.timepicker',
    'template/syTimepicker/timepicker.html',
    'template/syTimepicker/popup.html'

//    'ngResource'
])
.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, flowFactoryProvider, ngDialogProvider,  EditableTextHelperProvider) {
    // $urlRouterProvider.otherwise( '/home' );
    console.log("loading angular module");
    EditableTextHelperProvider.setWorkingText('<span class="fa fa-spin fa-spinner"></span>');
    
    $urlRouterProvider.otherwise(function ($injector, $location) {
        if ($location.$$url === '/') {
            window.location = '/home';
        }
//        else if ($location.$$url === '/login') {
//            window.location = '/login';
//        }
        else {
            // pass through to let the web server handle this request
            window.location = $location.$$absUrl;
        }
    });
    $locationProvider.html5Mode(true);
    flowFactoryProvider.defaults = {
      target: '/dsn/upload',
      permanentErrors: [500, 501],
      maxChunkRetries: 1,
      chunkRetryInterval: 5000,
      simultaneousUploads: 1,
      testChunks: false
    };
    flowFactoryProvider.on('catchAll', function (event) {
      console.log('catchAll', arguments);
    });
//    ngDialogProvider.setDefaults({
//        className: "ngdialog-theme-default",
//        plain: false,
//        showClose: true,
//        closeByDocument: true,
//        closeByEscape: true,
//        appendTo: false,
//        preCloseCallback: function () {
//            console.log("default pre-close callback");
//        }
//    });
    console.log("AppLevel config()");

})
// global services ( i.e. config stuff ... possibly from sails )
.factory('GS', function() {
  return {
      defaultDuration : 12
  };
})
//.config(['flowFactoryProvider', function (flowFactoryProvider) {
//    flowFactoryProvider.defaults = {
//      target: '/dsn/upload',
//      permanentErrors: [500, 501],
//      maxChunkRetries: 1,
//      chunkRetryInterval: 5000,
//      simultaneousUploads: 1,
//      testChunks: false
//    };
//    flowFactoryProvider.on('catchAll', function (event) {
//      console.log('catchAll', arguments);
//    });
//    console.log("AppLevel config()");
//    // Can be used with different implementations of Flow.js
////    flowFactoryProvider.factory = fustyFlowFactory;
//}])
//.config(['ngDialogProvider', function (ngDialogProvider) {
//    ngDialogProvider.setDefaults({
//        className: "ngdialog-theme-default",
//        plain: false,
//        showClose: true,
//        closeByDocument: true,
//        closeByEscape: true,
//        appendTo: false,
//        preCloseCallback: function () {
//            console.log("default pre-close callback");
//        }
//    });
//}])
/*
  //     ,
  //   '$templateCache',
  //    function($templateCache) {
  //        $templateCache.put('timePicker.tmpl', timePickerTemplate); // This saves the html template we declared before in the   $templateCache
  //    }
*/
.run( function (TSvc, CService, AssetSvc, $rootScope) {
    $rootScope.$watch($rootScope.selectedNetwork, function () {
        if ($rootScope.selectedNetwork) {
            console.log('App.run() selectedNetwork set');
            console.log($rootScope.selectedNetwork);
            AssetSvc.initialize($rootScope.selectedNetwork);
        }
    });
    moment.locale('en');
    TSvc.initialize();
    CService.loadProductTypes();
//    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
})
//.run( function run () {
//    moment.locale('en');
//})
.factory('AssetSvc', function($window, $rootScope, $http) {

    var initialized =  false;
    var rs = {};
    var getLayouts = function() {
          
            var url = '/dsn/layouts?nid='+$rootScope.selectedNetwork.id;
           console.log('AssetSvc.getLayouts : '+url);
           $http.get(url)
           .then(function(res){
              $rootScope.layouts = res.data;                
              console.log('AssetSvc.getLayouts found : '+$rootScope.layouts.length);
            });
    };
    
    var getDisplays = function() {
           var url = '/dsn/displays?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
           .then(function(res){
              $rootScope.displays = res.data;                
              console.log('AssetSvc.getDisplays found : '+$rootScope.displays.length);
            });
    };

    var getDisplayGroups = function() {
           var url = '/dsn/displayGroups?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
           .then(function(res){
              $rootScope.displaygroups = res.data;                
              console.log('AssetSvc.getDisplayGroups found : '+$rootScope.displaygroups.length);
            });
    };
    
    var getRuleTemplates = function() {
           $http.get('/templates/RuleTemplates.json')
               .then(function(res){
                  $rootScope.ruleTemplates = res.data;                
                  console.log('AssetSvc.getRuleTemplates found : '+$rootScope.ruleTemplates.length);
            });
    };

    var getLayoutTemplates = function() {
           $http.get('/templates/LayoutTemplates2.json')
           .then(function(res){
              $rootScope.layoutTemplates = res.data;                
              console.log('AssetSvc.getLayoutTemplates found : '+$rootScope.layoutTemplates.length);
            });
    };
    
    var getWheels = function() {
           var url = '/dsn/wheels?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
           .then(function(res){
              $rootScope.wheels = res.data;                
              console.log('AssetSvc.getWheels found : '+$rootScope.wheels.length);
            });
    };


    var getDisplay = function(id) {
            //console.log('AssetSvc.getDisplay called with : '+id);

            var collection = $rootScope.displays;
            console.log('AssetSvc.getDisplay called with : '+id+' , num displays : '+collection.length);
            if (collection) {
                for (var i=0; i < collection.length; i++) {
                    var displayElement = collection[i];
                    console.log('AssetSvc.getDisplay displayElement  : id : '+displayElement.id+' , _id : '+displayElement._id);
                    if (displayElement.id == id) {
                        console.log("AssetSvc.getDisplay found display : "+displayElement.id);
                        return displayElement;
                    }
                }
            }
            collection = $rootScope.displaygroups;
            if (collection) {
                for (var i=0; i < collection.length; i++) {
                    var displayElement = collection[i];
                    if (displayElement.id == id) {
                        console.log("AssetSvc.getDisplay found display group : "+displayElement.id);
                        return displayElement;
                    }
                }
            }

    };
    
    var getLayout = function(id) {
            var collection = $rootScope.layouts;
            if (collection) {
                for (var i=0; i < collection.length; i++) {
                    var layoutElement = collection[i];
                    if (layoutElement.id == id) {
                        console.log("AssetSvc.getLayout layout : "+layoutElement.id);
                        return displayElement;
                    }
                }
            }
            var collection = $rootScope.wheels;
            if (collection) {
                for (var i=0; i < collection.length; i++) {
                    var layoutElement = collection[i];
                    if (layoutElement.id == id) {
                        console.log("AssetSvc.getLayout wheel : "+layoutElement.id);
                        return layoutElement;
                    }
                }
            }
    };
        
    var initialize = function(sn) {
//            rs.selectedNetwork = sn;
            console.log('AssetSvc attempting to initialize()');
            if (initialized) {
                console.log('AssetSvc already initialized.');
                return;
            }
            if ($rootScope && $rootScope.selectedNetwork) {
                initialized = true;
                console.log('AssetSvc.initialize() called.');
                getDisplays();
                getDisplayGroups();
                getLayouts();
                getRuleTemplates();
                getWheels();
                getLayoutTemplates();
            }
    }; 
    return { initialize:initialize , getLayout:getLayout, getDisplay:getDisplay };
//    return AS;
//	return {
//		initialize: initialize,
//        getDisplay: getDisplay
//	};
})
.factory('saNavigationGuard', ['$window', function($window) {
	var guardians = [];

	var onBeforeUnloadHandler = function(event) {
		var message;
		if (_.any(guardians, function(guardian) { return !!(message = guardian()); })) {
			(event || $window.event).returnValue = message;
			return message;
		} else {
			return undefined;
		}
	}

	var registerGuardian = function(guardianCallback) {
		guardians.unshift(guardianCallback);
		return function() {
			var index = guardians.indexOf(guardianCallback);
			if (index >= 0) {
				guardians.splice(index, 1);
			}
		};
	};

	if ($window.addEventListener) {
		$window.addEventListener('beforeunload', onBeforeUnloadHandler);
	} else {
		$window.onbeforeunload = onBeforeUnloadHandler;
	}

	return {
		registerGuardian: registerGuardian
	};
}])
.factory('TSvc', function($rootScope, $http) {
//    console.log('TSVC Initialize()');
//    if (!$rootScope.mTemplates) {
//        console.log('TSVC calling to get .json');
//        $http.get('/templates/TemplateMaster.json')
//        .then(function(res){
//          console.log('get TemplateMaster found : '+JSON.stringify(res.data));
//          $rootScope.mTemplates = res.data;                
//        });
//    }     

    
     return {
        initialize: function() {
            console.log('TSVC Initialize()');
            if (!$rootScope.mTemplates) {
                console.log('TSVC calling to get .json');
                $http.get('/templates/TemplateMaster.json')
                .then(function(res){
//                  console.log('get TemplateMaster found : '+JSON.stringify(res.data));
                  $rootScope.mTemplates = res.data;                
                  console.log('get TemplateMaster found : '+$rootScope.mTemplates.length);
                });
            }     
        }, 
        setView: function(category, v) {
            var template = $rootScope.mTemplates[category][v];
            console.log('TSVC.setView : '+template.url);
            return template.url;
        },
        getView: function(category, v) {
            $scope.menuSelection = v;
            var template = $rootScope.mTemplates[category][$scope.menuSelection];
            console.log('MobileController.getView : '+$scope.template.url);
            return template.url;
        },
        getTemplate: function(category, v) {
            console.log('TSvc.getTemplate called '+category+','+v);
//            console.log('TSvc.getTemplate called '+category+','+v+' , mTemplate length : '+$rootScope.mTemplates.length);
            var cTemplates = $rootScope.mTemplates[category];
            console.log('TSvc.getTemplate cTemplates : '+JSON.stringify(cTemplates));

            var template = cTemplates[v];
            console.log('TSvc.getTemplate returning : '+JSON.stringify(template[0]));
            return template[0];
        },
        gTemplate: function(category, menu, page) {
            console.log('TSvc.gTemplate category : '+category+' , menu : '+menu+' , page : '+page);
            var cTemplates = $rootScope.mTemplates[category];
//            console.log('TSvc.gTemplate returning : '+JSON.stringify(cTemplates));
            var tList = cTemplates[menu];
//            console.log('TSvc.gTemplate returning : '+JSON.stringify(tList));
            if (page >= tList.length) {
                page = 0;
            }
            var tPageTemplate = tList[page];
            console.log('TSvc.gTemplate returning : '+JSON.stringify(tPageTemplate));
            return tPageTemplate;
        }
    };
})
.factory('ScopeMap', function ($rootScope, $http, TSvc) {
    console.log('creating ScopeMap factory.');
    $rootScope.scopeMap = {};

    return {
        store: function (key, value) {
            $rootScope.scopeMap[key] = value;
        },
        get: function (key) {
            var value = $rootScope.scopeMap[key];
            return $rootScope.scopeMap[key];
        }
    };
})
.factory('CService', function ($rootScope, $http) {
    console.log('creating ScopeMap factory.');
    $rootScope.companyInfo = {};
//    return {
    var CS = {
         
    };
    
    var self = this;
    var resetCompanyInfo = function() {
//        console.log('resetCompanyInfo()');
//        $scope.selectedImage ='';
//        $scope.image = '';
            $rootScope.companyInfo = {};
            $rootScope.companyInfo.id = '';
            $rootScope.companyInfo.logo = {path:'/images/320x60.png',width:'320',height:'60'};
            $rootScope.companyInfo.companyImage= {path:'/images/320x320.png',width:'320',height:'320'};
            $rootScope.companyInfo.companyTitle ='';
            $rootScope.companyInfo.companyInfo ='';

            $rootScope.companyInfo.mainTitle ='';
            $rootScope.companyInfo.mainInfo ='';
            $rootScope.companyInfo.mainImage= {path:'/images/640x480.png',width:'640',height:'480'};

            $rootScope.companyInfo.backgroundImage= {path:'/images/background.png',width:'1920',height:'1080'};

            $rootScope.companyInfo.address ='';
            $rootScope.companyInfo.email ='';
            $rootScope.companyInfo.phone ='';
            $rootScope.companyInfo.web ='';
            $rootScope.companyInfo.hours ='';

    };
    CS.loadProductTypes = function() {
       $http.get('/templates/ProductTypes.json')
       .then(function(res){
          $rootScope.productTypes = res.data;                
          console.log('loadProductTypes found : '+$rootScope.productTypes.length);
        });
    }
            
    CS.resetImage = function(name) {
            console.log('resetImage() : '+name);
            switch (name) {
                case 'logo':
                    $rootScope.companyInfo.logo.path = '/images/320x60.png';
                    break;
                case 'cimage':
                    $rootScope.companyInfo.companyImage.path = '/images/320x320.png';
                    break;
                case 'mimage':
                    $rootScope.companyInfo.mainImage.path = '/images/640x480.png';
                    break;
                case 'bgimage':
                    $rootScope.companyInfo.backgroundImage.path = '/images/background.png';
                    break;
            }
            $rootScope.selectedAsset.name = '';
            $rootScope.imageName = '';
            $rootScope.selectedAsset = '';
            $rootScope.selectedImage = '';
//            $scope.closeThisDialog();
    };
    CS.switchNetwork = function(sn) {
           console.log('switchNetwork - sn: '+sn.name+' , selectedNetwork : '+$rootScope.selectedNetwork.name);
           var url = '/network/companyInfo?nid='+sn.id;
           console.log('loadCompanyInfo, url : '+url);
           $http.get(url)
           .then(function(res){
               if (res.data) {
                   console.log('loadCompanyInfo returned : '+JSON.stringify(res.data));
                   $rootScope.companyInfo = res.data;
               } else {
                   console.log('resetCompanyInfo()');
                   resetCompanyInfo();
                   //$scope.resetCompanyInfo();
               }
            });
    };
    var loadCompanyInfo = function() {
           var url = '/network/companyInfo?nid='+$rootScope.selectedNetwork.id;
           console.log('loadCompanyInfo, url : '+url);
           $http.get(url)
           .then(function(res){
               if (res.data) {
                   console.log('loadCompanyInfo returned : '+JSON.stringify(res.data));
                   $rootScope.companyInfo = res.data;
               } else {
                   console.log('resetCompanyInfo()');
                   resetCompanyInfo();
                   //$scope.resetCompanyInfo();
               }
            });
    };
    
    CS.saveCompanyInfo = function() {
            console.log('saveCompanyInfo : '+JSON.stringify($rootScope.companyInfo));

            var url = '/network/saveCompanyInfo'; 
            if ($rootScope.companyInfo._id) {
                url+='?cid='+$rootScope.companyInfo._id;
            }
            $rootScope.companyInfo.network = $rootScope.selectedNetwork.id;
            $http({
                url: url,
                method: "POST",
                data: $rootScope.companyInfo,
                headers: {'Content-Type': "application/json" }
            }).success(function (response) {
                console.log('saveCompanyInfo returned response : '+JSON.stringify(response));
                $rootScope.companyInfo = response.data;
    //            callback(response);
                // refresh layouts on page
    //            $scope.getLayouts();
            });    
    };
    CS.resetCompanyInfo = resetCompanyInfo;
    CS.loadCompanyInfo = loadCompanyInfo;
    return CS;
})
//.directive('datetimepicker', function() {
//	    return {
//	        restrict: 'A',
//	        require: 'ngModel',
//	        link: function(scope, element, attrs, ngModel) {
//	            element.datetimepicker();
//                element.on('dp.change',function(val){
//                    ngModel.$setViewValue(val.date);
//                    scope.$apply()
//                });
//	        }
//	    };
//})
.directive('datetimez', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
          element.datetimepicker({           
           language: 'en',
           pickDate: false,          
          }).on('changeDate', function(e) {
            ngModelCtrl.$setViewValue(e.date);
            scope.$apply();
          });
        }
    };
})
.directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
})
.directive("tpicker", function() {
    return {
        restrict: 'E',
//        templateUrl: "timePicker.tmpl",
        templateUrl: "templates/timePickerTemplate.html",
        transclude: true,
        controller: function($scope) {

            var timeObj = {AM : [], PM : []};
            for (var i = 0; i <= 11; i++) {
                timeObj.AM.push({label : (i < 10 ? '0' + i : i),value : i});
            }
            timeObj.PM.push({label : 12,value : 12});
            for (var i = 1; i <= 11; i++) {
                timeObj.PM.push({label : (i < 10 ? '0' + i : i),value : i+12});
            }

          $scope.meridians = ["AM", "PM"];
          $scope.hours = timeObj.AM;
          $scope.minutes = ["00", "15", "30", "45"];

            if($scope.timeValue == undefined){
                $scope.timeValue = 9 * 60 * 60 * 1000;
            }

           $scope.toggleTimePicker = function() {
                $scope.selecting = !$scope.selecting;
           };

           $scope.$watch('timeValue', function(val) {
                 $scope.updateLabel(val);
           });

            $scope.selectMeridian = function(meridian) {
                $scope.hours = timeObj[meridian];
                $scope.timeValue = (meridian == "AM" ? (9 * 60 * 60 * 1000) : (15 * 60 * 60 * 1000));
            };

            $scope.selectHour = function(hour) {
                $scope.timeValue = (hour.value * 60 * 60 * 1000);
            };

            $scope.selectMinute = function(minute) {
                var time = $scope.timeValue;
                var mts = time%(60*60*1000);
                $scope.timeValue = (time-mts+minute* 60 * 1000);
            };

            $scope.updateLabel = function(timeValue) {
                var mts = timeValue%(60*60*1000);
                var hrs = (timeValue - mts)/(60*60*1000);
                var mts2 = mts/(60*1000);
                var mer = (hrs < 11) ? "AM" : "PM";
                var hrs2 = (hrs > 12) ? hrs-12 : hrs;

                $scope.timeLabel = (hrs2 < 10 ? '0'+hrs2 : hrs2) +":" + (mts2 == 0 ? '00' : mts2) +" " + mer;
            };
        }
      }
})
.filter("sanitize", ['$sce', function($sce) {
  return function(htmlCode){
// gregm , this is used like this:      <div ng-bind-html="whatever_needs_to_be_sanitized | sanitize"></div>
    return $sce.trustAsHtml(htmlCode);
  }
}]);

// alternatively 
//$scope.renderHtml = function(html_code)
//{
//    return $sce.trustAsHtml(html_code);
    // gregm used like this: <p ng-bind-html="renderHtml(value.button)"></p>
//};

  function getTypeForRegion(r) {
      if (r.name == 'web') {
          console.log('getTypeForRegion returning "text"');
          return "text";
      }
      return r.name;
  }

  function getToday() {
      var d = new Date();
      var today = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
//      var offset = today.getTimezoneOffset() * 60 * 1000;
//      var withOffset = today.getTime();
//      var withoutOffset = withOffset - offset;
//      today = new Date(withoutOffset);
//        today.setHours(0);
//        today.setMinutes(0);
//        today.setSeconds(0);
        return today;
  }


  function getTomorrow() {
      var now = moment();
      var d = now.add('days', 1);
      now = d.toDate();
      var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
//      var offset = today.getTimezoneOffset() * 60 * 1000;
//      var withOffset = today.getTime();
//      var withoutOffset = withOffset - offset;
//      today = new Date(withoutOffset);
//        today.setHours(0);
//        today.setMinutes(0);
//        today.setSeconds(0);
        return tomorrow;
  }

  function getTonight() {
        var d = new Date();
        var today = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 0, 0);

//        var offset = today.getTimezoneOffset() * 60 * 1000;
//        var withOffset = today.getTime();
//        var withoutOffset = withOffset - offset;
//        today = new Date(withoutOffset);
//        today.setHours(23);
//        today.setMinutes(59);
//        today.setSeconds(59);
        return today;
  }

  function adjustDate(d1, d2) {
      var d = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds());
      return d;
  }

  function addMinute(now, n) {
        var minutes = now.getMinutes();
        now.setMinutes(minutes+n);
        return now;
  }
  function addHour(now, n) {
        var hours = now.getHours();
        now.setDate(hours+n);
        return now;
  }

  function addDay(now, n) {
        var day = now.getDate();
        var toSet = day+(n*1);
//        console.log('addDay : setting date to : '+toSet);
        now.setDate(toSet);
        return now;
  }

  function addWeek(now, n) {
        var day = now.getDate();
        now.setDate(day+(7*n));
        return now;
  }

  function addMonth(now, n) {
        var day = now.getDate();
        var dayOfMonth = now.getDay();
        now.setDate(day+(30*n));
        now = normalizeDay(now, dayOfMonth);
        return now;
  }
  function addYear(now,n) {
        var year = now.getYear();
        var dayOfMonth = now.getDay();
        now.setYear(year+(n*365));
        now = normalizeDay(now, dayOfMonth);
        return now;
  }
  function subDay(now,n) {
        var day = now.getDate();
        var dayOfMonth = now.getDay();
        now.setDate(day-n);
        now = normalizeDay(now, dayOfMonth);
        return now;
  }
  function subWeek(now,n) {
        var day = now.getDate();
        var dayOfMonth = now.getDay();
        now.setDate(day-(7*n));
        now = normalizeDay(now, dayOfMonth);
        return now;
  }
  function subMonth(now,n) {
        var day = now.getDate();
        var dayOfMonth = now.getDay();
        
        now.setDate(day-(30*n));
        now = normalizeDay(now, dayOfMonth);
        return now;
  }
  function subYear(now,n) {
        var day = now.getDate();
        var dayOfMonth = now.getDay();
        now.setDate(day-(365*n));
        now = normalizeDay(now, dayOfMonth);
        return now;
  }

  function normalizeDay(now, dow) {
      var day  = now.getDate();
      var d = now.getDay();
      if (d != dow) {
          if (d < dow) {
              now.setDate(day-1);
          } else {
              now.setDate(day+1);
          }
      }
      return now;
  }

    function setLatLon(position, zoom) {
            var scope = angular.element($("#main")).scope();
            scope.$apply(function(){
                scope.setLatLon(position, zoom);
            })

    }

    function setLatLon(position, zoom) {
            var scope = angular.element($("#main")).scope();
            scope.$apply(function(){
                scope.setLatLon(position, zoom);
            })

    }

//        angular.element('[ng-controller=MapController]').scope().$apply(
//            function(){ 
//                console.log('inside setLatLon : '+position);
//                $scope.setLatLon(position);
//                
//                
//                x.foo = "bar"; 
//            
//            }
//        );
//
//    }

    function oForID( list, id ){
        var result;
        var length = list.length;
        console.log('oForID - list length : '+length);
        for (var i = 0; i < length; i++) {
            if (id == list[i]['id']) {
               result = list[i]; 
               break;
            }
        }
        return result;   
    }

    function oForName( list, name ){
        var result;
        var length = list.length;
        for (var i = 0; i < length; i++) {
            if (name == list[i]['name']) {
               result = list[i]; 
               break;
            }
        }
        return result;   
    }

    function containsName( list, name ){
        var result = false;
        var length = list.length;
        for (var i = 0; i < length; i++) {
            if (name == list[i]['name']) {
               result = true; 
               break;
            }
        }

        return result;   
    }
 // ref: http://stackoverflow.com/a/1293163/2343
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }

    
    //Template for the time picker, no CSS, pure HTML. The time-picker tag will be replaced by this
    var timePickerTemplate = [
        '<div class="timePicker">',
        '<label ng-click="toggleTimePicker()">', 
        '<input type="text" ng-model="timeLabel" ng-bind="timeValue" disabled>',
        '</label>',
        '<div class="cal-wraper shadow"  ng-show="selecting">',
        '<table>',
        '<tr class="navigation">',
        '<tr class="time">',
        '<td class="mer"><div ng-click="selectMeridian(meridian)" ng-repeat="meridian in meridians" ng-bind="meridian"></div></td>',
        '<td class="hours"><div ng-click="selectHour(hour)" ng-repeat="hour in hours" ng-bind="hour.label"></div></td>',
        '<td class="minutes"><div ng-click="selectMinute(minute)" ng-repeat="minute in minutes" ng-bind="minute"></div></td>',
        '</tr>',
        '</table>',
        '</div>',
        '</div>'
    ].join('\n');

    function generateLicenseKey(length, chars) {
        var mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        var result = '';
        for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }

