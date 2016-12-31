angular.module('kombi.dsn_controllers', []);
angular.module('kombi.dsn_controllers')
.controller("DSNController", function ($rootScope, $scope, GS, $document, $window, saNavigationGuard, ngDialog, $timeout, $compile, $http, Upload, ScopeMap, $filter, titleService ) {

    titleService.setTitle('Marketability');
    $scope.newMessage = {};
    $scope.currentUser = config.currentUser;

    var sortingOrder = 'name';
    //$scope.menuSelection = 0;
    $scope.loaded = false;
    $scope.dropText = 'Drop media files here...'
    $scope.file;
    $scope.files = [];
    $scope.calendarView = 'month';
//    $scope.current-day = "";
    $scope.calendarDay = new Date();
    $scope.viewDate = new Date();
    $scope.media = [];
    $scope.sortingOrder = sortingOrder;
    $scope.reverse = false;
    $scope.filteredMedia = [];
    $scope.pagedMedia = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 20;
    $scope.itemsPerPage = 12;
    $scope.maxSize = 5;
    
    $scope.getMedia = function() {
       var url = '/dsn/media';
       if ($rootScope.selectedNetwork) {
           url+='?nid='+$rootScope.selectedNetwork.id;
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
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

      // init the filtered items
    $scope.searchMedia = function () {
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
        $scope.currentPage = 0;
        // now group by pages
        $scope.groupToPages();
    };

//    this.$inject = ['$scope','$filter'];

       // calculate page in place
    $scope.groupToPages = function () {
        $scope.pagedMedia = [];
        
        if ($scope.filteredMedia) {
            for (var i = 0; i < $scope.filteredMedia.length; i++) {
                if (i % $scope.itemsPerPage === 0) {
                    $scope.pagedMedia[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredMedia[i] ];
                } else {
                    $scope.pagedMedia[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredMedia[i]);
                }
            }
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
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };
    
    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedMedia.length - 1) {
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
        var sid = calendarEvent.sid.split("-")[0];
        var url = '/dsn/findSchedule?id='+sid; 
        $http.get(url)
           .then(function(res){
              var schedule = res.data;                
                console.log('findSchedule to edit : '+schedule);
                $rootScope.layoutElement = schedule.layoutElement;
                $rootScope.currentSchedule = schedule;
                $rootScope.leType = schedule.leType;
                ngDialog.open({
                    template: '/templates/dsn/popups/scheduleEvent.html',
                    showClose: false,
                    controller: 'ScheduleDialogController',
                    className: 'ngdialog-theme-default ngdialog-theme-custom'
                });
        });
    }
    
    $scope.eventDeleted = function(calendarEvent) {
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
        });    
        $scope.events = [];
        $scope.getSchedules();
        $scope.$broadcast('calendar.refreshView');
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

    
    $scope.templates =
       [ 
        {name: 'schedule.html', url: '/templates/dsn/schedule.html'},
        {name: 'wheel.html', url: '/templates/dsn/wheel.html'},
        {name: 'layouts.html', url: '/templates/dsn/layouts.html'},
        {name: 'templates.html', url: '/templates/dsn/templates.html'},
        {name: 'resolutions.html', url: '/templates/dsn/resolutions.html'},
        {name: 'media.html', url: '/templates/dsn/media.html'},
        {name: 'data.html', url: '/templates/dsn/data.html'},
        {name: 'rules.html', url: '/templates/dsn/rules.html'},
//        {name: 'datasets.html', url: '/templates/dsn/datasets.html'},
        {name: 'displays.html', url: '/templates/dsn/displays.html'},
        {name: 'dgroups.html', url: '/templates/dsn/dgroups.html'},
        {name: 'statistics.html', url: '/templates/dsn/statistics.html'},
        {name: 'settings.html', url: '/templates/dsn/settings.html'},
        {name: 'rules.html', url: '/templates/dsn/rules.html'}
        ];
    
    var ms = ScopeMap.get('dsn.menuSelection');
    if (ms) {
        $scope.menuSelection = ms;
    }
 
    var navigationGuardian = function() {
        console.log('storing menuSelection')
        ScopeMap.store('dsn.menuSelection', $scope.menuSelection);
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

    $scope.getSchedules = function() {
       console.log('getting schedules...');
       $http.get('/dsn/schedules')
       .then(function(res){
           console.log('back from getting schedules : '+res.data.length);
           for (var i = 0; i < res.data.length; i++) {
              var startEventNumber = 0; 
              var schedule = res.data[i];
              if (schedule != null) {
                  var event = null;
                  var startDate = new Date(schedule.startsAt);
                  var endDate = new Date(schedule.endsAt);
                  if (schedule.recursOn) {
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
                          switch (schedule.recursOn.toLowerCase()) {
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
                  } else {
                      event = {};
                      event.title ='Signage Schedule';
                      event.id = schedule.id;
                      event.startsAt = new Date(schedule.startsAt);
                      event.endsAt =   new Date(schedule.endsAt);
                      event.editable = true;
                      event.deletable = false;
                      event.draggable = true;
                      event.resizable = true;
                      event.schedule = schedule;

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

     $scope.$watch('file', function() {
        var file = $scope.file;
        if (!file) {
          return;
        }
        Upload.upload({
          url: '/dsn/upload',
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
      });;

    $scope.removeMedia = function(id) {
        var url = '/dsn/removeMedia?mid='+id; 
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
    
    $scope.init = function() {
        $scope.getMedia();
        var ms = ScopeMap.get('dsn.menuSelection');
        if (ms) {
            console.log("DSNController.init() setting menuSelection to : "+ms);
            $scope.menuSelection = ms;
            $scope.loaded = true;
        } else {
            $scope.loaded = false;
            console.log("DSNController.init() setting menuSelection to 0");
            $scope.menuSelection = 0;    
        }
        
    }
    
    $scope.template = $scope.templates[$scope.menuSelection];
    $scope.view = {
        setView: function() {
//            if (!$scope.loaded) {
                var ms = ScopeMap.store('dsn.menuSelection', $scope.menuSelection);
                if (ms) {
//                    console.log("DSNController.init() setting menuSelection to : "+ms);
                    $scope.menuSelection = ms;
                }
                $scope.template = $scope.templates[$scope.menuSelection];
//                console.log('DSNController.setView : '+$scope.template.url);
                return $scope.template.url;
//            }
            
        },
        getView: function(v) {
//            if (v != $scope.menuSelection) {
//                ScopeMap.store('dsn.menuSelection', $scope.menuSelection);
//                $scope.loaded = true;
                $scope.menuSelection = v;
                $scope.template = $scope.templates[$scope.menuSelection];
//                console.log('DSNController.getView : '+$scope.template.url);
                return $scope.template.url;
//            }
        }
    };
    $scope.$on('$viewContentLoaded', function(){
        console.log('DSNController.$viewContentLoaded');
       // initComponents();
    });
    
    $scope.childOnLoad = function() {
            console.log('DSNController.childOnLoad');
//            initComponents();
    };
    
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
            className: 'ngdialog-theme-default ngdialog-theme-custom'
        });
        //FileUploadCtrl($scope);

    };
    $scope.duplicateWheel = function (le) {
        console.log("duplicateWheel");
        var newObj = $.extend(true, {}, le);
        // clear the id field
        newObj.id = null;
//        newObj.name = newObj.name.split('()')[0]+'(2)';
        newObj.name = newObj.name +'(2)';
        newObj.network = $rootScope.selectedNetwork.id;
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
        if (dg) {
            $rootScope.currentDisplayGroup = dg;
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
        console.log("openEditLayoutDialog for : "+layout.id);
        ngDialog.open({
            template: '/templates/dsn/popups/layoutTemplate.html',
            showClose: false,
            controller: 'LayoutEditDialogController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope
        });
    }
    
    $scope.getDisplayGroups = function() {
       $http.get('/dsn/displayGroups')
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
       $http.get('/templates/LayoutTemplates.json')
       .then(function(res){
          $scope.layoutTemplates = res.data;                
          console.log('getLayoutTemplates found : '+$scope.layoutTemplates.length);
        });
    }
    
    $scope.getLayouts = function() {
       var url = '/dsn/layouts?nid='+$rootScope.selectedNetwork.id;
       $http.get(url)
       .then(function(res){
          $scope.layouts = res.data;                
          console.log('getLayouts found : '+$scope.layouts.length);
        });
    }
    
    $scope.getDisplays = function() {
       var url = '/dsn/displays?nid='+$rootScope.selectedNetwork.id;
       $http.get(url)
       .then(function(res){
          $scope.displays = res.data;                
          console.log('getDisplays found : '+$scope.displays.length);
        });
    }
    
    $scope.getWheels = function() {
       var url = '/dsn/wheels?nid='+$rootScope.selectedNetwork.id;
       $http.get(url)
       .then(function(res){
          $scope.wheels = res.data;                
          console.log('getWheels found : '+$scope.wheels.length);
        });
    }
    
    $scope.findLayoutForMedia = function(mid, cb) {
        var url = '/dsn/layoutWithMedia?id='+mid; 
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
    $scope.saveLayout = function() {
        $rootScope.currentLayout.regions = $scope.layoutTemplate.regions;
        $rootScope.currentLayout.width = $scope.layoutTemplate.width;
        $rootScope.currentLayout.height = $scope.layoutTemplate.height;
        $rootScope.currentLayout.template = $scope.layoutTemplate.name;
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
            var uri = "/dsn/upload";
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
//                data: $rootScope.currentMedia,
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
               $http.get('/dsn/layouts')
               .then(function(res){
                  $scope.layouts = res.data;                
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
                url+='?mid='+$rootScope.currentMedia.id;
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
            
           var url = '/dsn/wheels?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
               .then(function(res){
                  $scope.wheels = res.data;                
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
                console.log("setting defaultLayoutId");
                $scope.currentDisplay.defaultLayoutId = $scope.selectedLayout.id;
            }
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

})
.controller("MobileController", function ($scope, $window, ngDialog) {

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

    $scope.templates =
           [
             {name: 'schedule.html', url: '/templates/mobile/schedule.html'},
             {name: 'vouchers.html', url: '/templates/mobile/distributions.html'},
             {name: 'coupons.html', url: '/templates/mobile/offers.html'},
             {name: 'media.html', url: '/templates/mobile/media.html'},
             {name: 'datasets.html', url: '/templates/mobile/datasets.html'},
             {name: 'rules.html', url: '/templates/mobile/rules.html'},
             {name: 'hosted.html', url: '/templates/mobile/hosted.html'},
             {name: 'events.html', url: '/templates/mobile/events.html'},
             {name: 'redemptions.html', url: '/templates/mobile/redemptions.html'}
            ];

//             {name: 'campaigns.html', url: '/templates/mobile/campaigns.html'},
//             {name: 'brands.html', url: '/templates/mobile/brands.html'},

    
    $scope.template = $scope.templates[$scope.menuSelection];
    $scope.view = {
        setView: function() {
//            $scope.menuSelection = v;
            $scope.template = $scope.templates[$scope.menuSelection];
            console.log('MobileController.setView : '+$scope.template.url);
            return $scope.template.url;
        },
        getView: function(v) {
            $scope.menuSelection = v;
            $scope.template = $scope.templates[$scope.menuSelection];
            console.log('MobileController.getView : '+$scope.template.url);
            return $scope.template.url;
        }
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

    $scope.templates =
           [ {name: 'management.html', url: '/templates/sensors/management.html'},
             {name: 'rules.html', url: '/templates/sensors/rules.html'},
             {name: 'counts.html', url: '/templates/sensors/counts.html'},
             {name: 'demographics.html', url: '/templates/sensors/demographics.html'},
             {name: 'security.html', url: '/templates/sensors/security.html'}
            ];
    
    $scope.template = $scope.templates[$scope.menuSelection];
    $scope.view = {
        setView: function() {
//            $scope.menuSelection = v;
            $scope.template = $scope.templates[$scope.menuSelection];
            console.log('NetworkController.setView : '+$scope.template.url);
            return $scope.template.url;
        },
        getView: function(v) {
            $scope.menuSelection = v;
            $scope.template = $scope.templates[$scope.menuSelection];
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
.controller("StoreController", function ($scope, $window) {
    
    $scope.menuSelection = 0;

    $scope.templates =
           [ {name: 'products.html', url: '/templates/mobile/products.html'},
             {name: 'licenses.html', url: '/templates/mobile/licenses.html'},
             {name: 'cart.html', url: '/templates/mobile/cart.html'}
            ];
    
    $scope.template = $scope.templates[$scope.menuSelection];
    $scope.view = {
        setView: function() {
//            $scope.menuSelection = v;
            $scope.template = $scope.templates[$scope.menuSelection];
            console.log('NetworkController.setView : '+$scope.template.url);
            return $scope.template.url;
        },
        getView: function(v) {
            $scope.menuSelection = v;
            $scope.template = $scope.templates[$scope.menuSelection];
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
            var url = '/dsn/rules?nid='+$rootScope.selectedNetwork.id; 
           $http.get(url)
           .then(function(res){
              $scope.rules = res.data;                
        });
    }

    $scope.getMedia = function() {
            var url = '/dsn/media?nid='+$rootScope.selectedNetwork.id; 
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
            var url = '/dsn/media?nid='+$rootScope.selectedNetwork.id; 
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
.controller("LayoutEditDialogController", function ($scope, $rootScope, $http) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
        $scope.media = [];
        $scope.numRegions = 0;
        $scope.initialize = function() {
            $scope.getLayoutTemplates();
            $scope.getRuleTemplates();
            if ($rootScope.currentLayout) {
                console.log('initialize looking for template : '+$rootScope.currentLayout.template);
                // first get the layoutTemplates
                
               $http.get('/templates/LayoutTemplates.json')
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
                $scope.layoutTemplate = $scope.layoutTemplates[0];
            }
        }
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
           $http.get('/templates/LayoutTemplates.json')
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
        
        $scope.saveLayout = function() {
            if (!$rootScope.currentLayout.regions) {
                $rootScope.currentLayout.regions = $scope.layoutTemplate.regions;
            }
            $rootScope.currentLayout.width = $scope.layoutTemplate.width;
            $rootScope.currentLayout.height = $scope.layoutTemplate.height;
            $rootScope.currentLayout.template = $scope.layoutTemplate.name;
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
                // refresh layouts on page
//                $scope.getLayouts();
            });    

        }

})
.controller("LayoutAssignDialogController", function ($scope, $rootScope, $http, $filter) {

  var sortingOrder = 'name';

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
//        $scope.media = [];
//        $scope.pagedMedia = [];
        $scope.currentMediaPage = 0;
        $scope.mediaPageSize = 20;
        $scope.totalMedia = 200;
        $scope.numRegions = 0;
        $scope.currentMediaPage = 0;
    
    $scope.media = [];
    $scope.sortingOrder = sortingOrder;
    $scope.reverse = false;
    $scope.filteredMedia = [];
    $scope.pagedMedia = [];
//    $scope.currentPage = 1;
    $scope.numPerPage = 20;
    $scope.itemsPerPage = 12;
    $scope.maxSize = 5;
    
//    $scope.getMedia = function() {
//       $http.get('/dsn/media')
//       .then(function(res){
//          $scope.media = res.data;
//          $scope.searchMedia();
//          console.log('getMedia found : '+$scope.media.length);
//        });
//    }
    $scope.updatedMedia = function() {
        console.log('updateMedia()');
        $scope.getMedia();
        $scope.$apply();
    }

    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

      // init the filtered items
    $scope.searchMedia = function () {
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
        $scope.pagedMedia = [];
        
        if ($scope.filteredMedia) {
            for (var i = 0; i < $scope.filteredMedia.length; i++) {
                if (i % $scope.itemsPerPage === 0) {
                    $scope.pagedMedia[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredMedia[i] ];
                } else {
                    $scope.pagedMedia[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredMedia[i]);
                }
            }
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
        if ($scope.currentMediaPage < $scope.pagedMedia.length - 1) {
            $scope.currentMediaPage++;
        }
    };
    
    $scope.setPage = function () {
        $scope.currentMediaPage = this.n;
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
    
    $scope.getMedia = function() {
                $scope.media = [];
                var url = '/dsn/media?nid='+$rootScope.slectedNetwork.id;
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
    
    $scope.updateMediaList = function() {
                var url = '/dsn/media';
                if ($scope.selectedRegion && $scope.selectedRegion.name) {
                    console.log('updateMediaList - media with type : '+$scope.selectedRegion);
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
       $http.get('/templates/LayoutTemplates.json')
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
        $scope.getLayouts = function() {
               var url = '/dsn/layouts?nid='+$rootScope.selectedNetwork.id; 
               $http.get('/dsn/layouts')
               .then(function(res){
                  $scope.layouts = res.data;                
            });
        }
        
        $scope.initialize = function() {
            $scope.getLayouts();
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
           $http.get('/templates/LayoutTemplates.json')
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
//        $scope.selectedLayout = {};
        $scope.media = [];
        $scope.numRegions = 0;
    
        $scope.getWheels = function() {
           var url = '/dsn/wheels?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
               .then(function(res){
                  $scope.wheels = res.data;                
            });
        }
        
        $scope.updateDefaultLayout = function() {
            console.log("updateDefaultLayout() selectedLayout : "+$scope.selectedLayout);
//            $scope.selectedLayout = layout;
            if ($scope.selectedLayout) {
                console.log("setting defaultLayoutId");
                $scope.currentDisplay.defaultLayoutId = $scope.selectedLayout.id;
            }
        }
        
        $scope.getLayouts = function() {
               $http.get('/dsn/layouts')
               .then(function(res){
                  $scope.layouts = res.data;                
            });
        }
        
        $scope.initialize = function() {
            $scope.getLayouts();
            $scope.getWheels();
            if (!$rootScope.currentDisplay) {
                $rootScope.currentDisplay = {};
            } else {
                if ($rootScope.currentDisplay.defaultLayoutId) {
                    console.log("loading default layout from API  : "+$rootScope.currentDisplay.defaultLayoutId);
                    var url = '/dsn/layout?lid='+$rootScope.currentDisplay.defaultLayoutId; 
                    $http({
                        url: url,
                        method: "POST",
                        data: $rootScope.currentDisplay.defaultLayoutId,
                        headers: {'Content-Type': "application/json" }
                    }).success(function (response) {
                        console.log('currentWheel returned response : '+response);
                        $scope.selectedLayout = response;
                    });    

                }
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

})
.controller("DGroupDialogController", function ($scope, $rootScope, $http) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
//        $scope.selectedLayout = {};
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
.controller("ScheduleDialogController", function ($scope, $rootScope, $http) {

        $scope.layoutTemplate = {};
        $scope.layoutTemplates = [];
//        $scope.selectedLayout = {};
        $scope.media = [];
        $scope.numRegions = 0;
        $scope.displayElements = [];
        $scope.startsAtOpen = false;
        $scope.endsAtOpen = false;
        $scope.recRangeOpen = false;
        $scope.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };

        $scope.disabled = function(date, mode) {
            return false;
            //(mode === 'day' && (new Date().toDateString() == date.toDateString()));
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
               $http.get('/dsn/layouts')
               .then(function(res){
                  $scope.layouts = res.data;                
            });
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
            $rootScope.currentSchedule.startsAt = $scope.startsAt;
            $rootScope.currentSchedule.endsAt = $scope.endsAt;
            $rootScope.currentSchedule.displayElements = [];
            $rootScope.currentSchedule.leType = $rootScope.leType;
            $rootScope.currentSchedule.layoutElement = $rootScope.layoutElement;
            $rootScope.currentSchedule.recursOn = $scope.recursOn;
            $rootScope.currentSchedule.recDetail = $scope.recDetail;
            $rootScope.currentSchedule.recRange = $scope.recRange;
            $rootScope.currentSchedule.network = $rootScope.selectedNetwork.id;
            for (var i=0; i < $scope.displayElements.length; i++) {
                $rootScope.currentSchedule.displayElements.push($scope.displayElements[i].id);
            }
            console.log('saving schedule : '+$rootScope.currentSchedule);
            var url = '/dsn/saveSchedule'; 
            if ($rootScope.currentSchedule.id) {
                url+='?lid='+$rootScope.currentSchedule.id;
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
           var url = '/dsn/wheels?nid='+$rootScope.selectedNetwork.id;
           $http.get(url)
               .then(function(res){
                  $scope.wheels = res.data;                
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
                console.log("setting defaultLayoutId");
                $scope.currentDisplay.defaultLayoutId = $scope.selectedLayout.id;
            }
        }
        
        $scope.showStart = function() {
            console.log("startAt : "+$scope.startAt.toString());
        }
        
        $scope.initialize = function() {
            // TODO : try to put this in async parallel
            console.log("ScheduleDialogController initialize()");
            $scope.getLayouts();
            $scope.getWheels();
            $scope.getDisplays();
            $scope.getDisplayGroups();
            $scope.repeatsSelected = "";
            $scope.displayOrder = 0;

            var today = getToday();
            $scope.startsAt = today; 
            var tonight = getTonight();
            $scope.endsAt = tonight;

            if ($rootScope.currentSchedule && $rootScope.currentSchedule.startsAt) {
                $scope.startsAt = new Date($rootScope.currentSchedule.startsAt); 
            } else {
                var today = getToday();
                $scope.startsAt = today; 
            }

            if ($rootScope.currentSchedule && $rootScope.currentSchedule.endsAt) {
                $scope.endsAt = new Date($rootScope.currentSchedule.endsAt); 
            } else {
                var tonight = getTonight();
                $scope.endsAt = tonight; 
            }

            if ($rootScope.currentSchedule && $rootScope.currentSchedule.endsAt) {
                $scope.endsAt = new Date($rootScope.currentSchedule.endsAt); 
            } else {
                var tonight = getTonight();
                $scope.endsAt = tonight; 
            }
            if ($rootScope.currentSchedule && $rootScope.currentSchedule.recRange) {
                console.log("ScheduleDialogController initialize() setting recRange : "+$rootScope.currentSchedule.recRange);
                $scope.recRange = new Date($rootScope.currentSchedule.recRange); 
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

})
