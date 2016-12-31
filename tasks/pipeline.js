/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
    'lib/bootstrap-3.3.6-dist/css/bootstrap.min.css',
    'lib/leaflet/dist/MarkerCluster.Default.css',
    '/font-awesome/css/font-awesome.css',
    '/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css',
//    'css/datetimepicker.css',
//    'bower_components/angular-time-picker/dist/angular-time-picker.min.css',
    'bower_components/angular-bootstrap-datetimepicker/dist/css/datetimepicker.css',
//    'bower_components/zhaber/datetimepicker.css',
    'bower_components/angular-editable-text/dist/angular-editable-text.min.css',
    'css/ngDialog.css',
    'css/ngDialog-theme-default.css',
    'styles/**/*.css'
//    'bower_components/angular-ui-bootstrap-datetimepicker/datetimepicker.css'
];

// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [
    '/lib/jquery-1.11.3.js',
//    'lib/angular.1.4.7/angular.js',
    'bower_components/angular/angular.js',
    'lib/bootstrap/js/bootstrap.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls-1.3.3.js',
    'bower_components/angular-ui-bootstrap/src/dateparser/dateparser.js',
//    ui-bootstrap-tpls.min.js',
    //    'bower_components/angular-time-picker/dist/angular-time-picker.min.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/sails.io.js/dist/sails.io.js',
    'bower_components/angularSails/dist/ngsails.io.js',
    'bower_components/lodash/lodash.js',
    'bower_components/angular-dateParser/dist/angular-dateparser.js',
//    'bower_components/zhaber/datetimepicker.js',
//    'bower_components/angular-ui-bootstrap-datetimepicker/datetimepicker.js',
//    'bower_components/angular-timepicker/dist/angular-timepicker.js',
//    'bower_components/moment/moment.js',
    'bower_components/moment/moment.js',
    'bower_components/angular-moment/angular-moment.js',
    
    'bower_components/angular-bootstrap-datetimepicker/dist/js/datetimepicker.js',
    'bower_components/angular-bootstrap-datetimepicker/dist/js/datetimepicker.templates.js',
    
    
    'bower_components/angular-credit-cards/release/angular-credit-cards.js',
    'bower_components/angular-csv-import/dist/angular-csv-import.js',
    'bower_components/angular-editable-text/dist/angular-editable-text.min.js',
    'bower_components/angular-img-cropper/dist/angular-img-cropper.min.js',
    'bower_components/ng-file-upload/ng-file-upload.js',
    'bower_components/ng-file-upload/ng-file-upload-shim.js',
    'bower_components/angularUtils-pagination/dirPagination.js',
    'lib/angular-ui.js',

//    'bower_components/angular-bootstrap-datetimepicker/dist/js/datetimepicker.js',
//    'bower_components/angular-bootstrap-datetimepicker/dist/js/datetimepicker.templates.js',

    'lib/c3/c3.js',
    'lib/simple-logger/index.js',
    'lib/angular-leaflet-directive.js',
    'lib/leaflet-1.0/dist/leaflet.js',
    'lib/leaflet/dist/leaflet.markercluster-src.js',
    'lib/leaflet-providers.js',
    'chartData/kombiLeaf.js',
    'chartData/visitmetrics.js',
    'lib/leaflet.draw/dist/leaflet.draw.js',
    'lib/leaflet-plugins/layer/tile/Bing.js',
    '/lib/jasny/bootstrap-fileupload.js',
    '/lib/jasny/bootstrap-typeahead.js',
    '/js/responsive-tables.js',
    '/js/date.js',
    '/js/daterangepicker.js',
    '/js/jquery.spellchecker.js',
    '/js/parsley.js',
    '/js/jquery.masonry.min.js',
    '/js/custom.js',
    '/js/d3.v3.min.js',
    '/js/jquery.simplemodal-1.4.4.js',
    '/js/moment.js',
    '/js/rivets.min.js',
    '/js/c3.min.js',
    '/js/jquery.tablesorter.min.js',
    '/js/kombiUtility.js',
    '/js/fcsaNumber.js',
    '/js/ng-flow-standalone.js',
//    '/js/ng-file-upload.min.js',
    '/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.min.js',
    
  //
  // *->    you might put other dependencies like jQuery or Angular here   <-*
  //

  // All of the rest of your app scripts
//    'js/timepickerpop.js',
  
  'js/tpicker/position.js',
  'js/tpicker/timepicker.js',
  'js/tpicker/timepicker-tpl.js',

    'js/ngDialog2.js',
    
    
    'src/**/*.js'

];

module.exports.jsFilesToInjectNoPathChange = jsFilesToInject;


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  // 'templates/**/*.html'
  'src/**/*.tpl.html'
];


// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
  return 'assets/' + path;
});