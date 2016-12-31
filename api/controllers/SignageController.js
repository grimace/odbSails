/**
 * SignageController
 *
 * @description :: Server-side logic for managing signages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  scheduleView: function(req, res) {

    res.locals.scripts = [
      //'//www.shieldui.com/shared/components/latest/js/jquery-1.10.2.min.js',
      //'/styles/default/libraries/jquery/jquery-1.11.1.min.js',
      '//www.shieldui.com/shared/components/latest/js/shieldui-all.min.js',
      '/styles/default/libraries/jquery/jquery.validate.min.js',
      '/styles/default/libraries/jquery/additional-methods.min.js',
      '/styles/default/libraries/bootstrap/js/bootstrap.min.js',
      '/styles/default/libraries/bootstrap/js/bootbox.min.js',
      '/styles/default/libraries/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
      '/styles/default/libraries/jquery-tablesorter/js/jquery.tablesorter.min.js',
      '/styles/default/libraries/jquery-tablesorter/js/jquery.tablesorter.widgets.min.js',
      '/styles/default/libraries/jquery-tablesorter/js/parsers/parser-input-select.js',
      '/styles/default/libraries/jquery-tablesorter/js/widgets/widget-grouping.js',
      '/styles/default/libraries/jquery-tablesorter/js/widgets/widget-pager.js',
      '/styles/default/libraries/jquery/jquery-ui/jquery-ui-1.10.2.custom.min.js',
      '/styles/default/libraries/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js',
      '/styles/default/libraries/bootstrap-select/js/bootstrap-select.min.js',
      '/styles/default/libraries/bootstrap-ekko-lightbox/ekko-lightbox.min.js',
      '/styles/default/libraries/underscore/underscore-min.js',
      '/styles/default/libraries/jstimezonedetect/jstz.min.js',
      '/styles/default/libraries/calendar/js/calendar.js',
      '/styles/default/libraries/date-time-format.js',
      '/styles/default/libraries/momentjs/moment.js',
      '/styles/default/libraries/morrisjs/raphael.min.js',
      '/styles/default/libraries/morrisjs/morris.min.js',
      '/styles/default/libraries/colors/colors.min.js',
      //'/styles/default/js/xibo-cms.js',
      '/styles/default/js/xibo-forms.js',
      '/styles/default/js/xibo-layout-designer.js',
      '/styles/default/js/xibo-preview-timeline.js',
      '/styles/default/js/xibo-calendar.js',
      '/styles/default/js/xibo-datasets.js'
    ];
    res.view('signage/schedule');

 },

  displayView: function(req, res) {
    res.locals.scripts = [
      '/styles/default/libraries/jquery/jquery.validate.min.js',
      '/styles/default/libraries/jquery/additional-methods.min.js',
      '/styles/default/libraries/bootstrap/js/bootstrap.min.js',
      '/styles/default/libraries/bootstrap/js/bootbox.min.js',
      '/styles/default/libraries/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
      '/styles/default/libraries/jquery-tablesorter/js/jquery.tablesorter.min.js',
      '/styles/default/libraries/jquery-tablesorter/js/jquery.tablesorter.widgets.min.js',
      '/styles/default/libraries/jquery-tablesorter/js/parsers/parser-input-select.js',
      '/styles/default/libraries/jquery-tablesorter/js/widgets/widget-grouping.js',
      '/styles/default/libraries/jquery-tablesorter/js/widgets/widget-pager.js',
      '/styles/default/libraries/jquery/jquery-ui/jquery-ui-1.10.2.custom.min.js',
      '/styles/default/libraries/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js',
      '/styles/default/libraries/bootstrap-select/js/bootstrap-select.min.js',
      '/styles/default/libraries/bootstrap-ekko-lightbox/ekko-lightbox.min.js',
      '/styles/default/libraries/underscore/underscore-min.js',
      '/styles/default/libraries/jstimezonedetect/jstz.min.js',
      '/styles/default/libraries/calendar/js/calendar.js',
      '/styles/default/libraries/ckeditor/ckeditor.js',
      '/styles/default/libraries/bootstrap/js/bootstrap-ckeditor-fix.js',
      '/styles/default/libraries/jquery-file-upload/js/tmpl.min.js',
      '/styles/default/libraries/jquery-file-upload/js/load-image.min.js',
      '/styles/default/libraries/jquery-file-upload/js/jquery.iframe-transport.js',
      '/styles/default/libraries/jquery-file-upload/js/jquery.fileupload.js',
      '/styles/default/libraries/jquery-file-upload/js/jquery.fileupload-process.js',
      '/styles/default/libraries/jquery-file-upload/js/jquery.fileupload-resize.js',
      '/styles/default/libraries/jquery-file-upload/js/jquery.fileupload-validate.js',
      '/styles/default/libraries/jquery-file-upload/js/jquery.fileupload-ui.js',
      '/styles/default/libraries/jquery-message-queuing/jquery.ba-jqmq.min.js',
      '/styles/default/libraries/date-time-format.js',
      '/styles/default/libraries/momentjs/moment.js',
      '/styles/default/libraries/morrisjs/raphael.min.js',
      '/styles/default/libraries/morrisjs/morris.min.js',
      '/styles/default/libraries/colors/colors.min.js',
      '/styles/default/js/xibo-cms.js',
      '/styles/default/js/xibo-forms.js',
      '/styles/default/js/xibo-layout-designer.js',
      '/styles/default/js/xibo-preview-timeline.js',
      '/styles/default/js/xibo-calendar.js',
      '/styles/default/js/xibo-datasets.js'
    ];
    res.view('signage/display');
  },

  libraryView: function(req, res) {
    res.locals.scripts = [

      '/styles//default/libraries/jquery/jquery.validate.min.js',
      '/styles//default/libraries/jquery/additional-methods.min.js',
      '/styles//default/libraries/bootstrap/js/bootstrap.min.js',
      '/styles//default/libraries/bootstrap/js/bootbox.min.js',
      '/styles//default/libraries/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
      '/styles//default/libraries/jquery-tablesorter/js/jquery.tablesorter.min.js',
      '/styles//default/libraries/jquery-tablesorter/js/jquery.tablesorter.widgets.min.js',
      '/styles//default/libraries/jquery-tablesorter/js/parsers/parser-input-select.js',
      '/styles//default/libraries/jquery-tablesorter/js/widgets/widget-grouping.js',
      '/styles//default/libraries/jquery-tablesorter/js/widgets/widget-pager.js',
      '/styles//default/libraries/jquery/jquery-ui/jquery-ui-1.10.2.custom.min.js',
      '/styles//default/libraries/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js',
      '/styles//default/libraries/bootstrap-select/js/bootstrap-select.min.js',
      '/styles//default/libraries/bootstrap-ekko-lightbox/ekko-lightbox.min.js',
      '/styles//default/libraries/underscore/underscore-min.js',
      '/styles//default/libraries/jstimezonedetect/jstz.min.js',
      '/styles//default/libraries/calendar/js/calendar.js',
      '/styles//default/libraries/ckeditor/ckeditor.js',
      '/styles//default/libraries/bootstrap/js/bootstrap-ckeditor-fix.js',
      '/styles//default/libraries/jquery-file-upload/js/tmpl.min.js',
      '/styles//default/libraries/jquery-file-upload/js/load-image.min.js',
      '/styles//default/libraries/jquery-file-upload/js/jquery.iframe-transport.js',
      '/styles//default/libraries/jquery-file-upload/js/jquery.fileupload.js',
      '/styles//default/libraries/jquery-file-upload/js/jquery.fileupload-process.js',
      '/styles//default/libraries/jquery-file-upload/js/jquery.fileupload-resize.js',
      '/styles//default/libraries/jquery-file-upload/js/jquery.fileupload-validate.js',
      '/styles//default/libraries/jquery-file-upload/js/jquery.fileupload-ui.js',
      '/styles//default/libraries/jquery-message-queuing/jquery.ba-jqmq.min.js',
      '/styles//default/libraries/date-time-format.js',
      '/styles//default/libraries/momentjs/moment.js',
      '/styles//default/libraries/morrisjs/raphael.min.js',
      '/styles//default/libraries/morrisjs/morris.min.js',
      '/styles//default/libraries/colors/colors.min.js',
      '/styles//default/js/xibo-cms.js',
      '/styles//default/js/xibo-forms.js',
      '/styles//default/js/xibo-layout-designer.js',
      '/styles//default/js/xibo-preview-timeline.js',
      '/styles//default/js/xibo-calendar.js',
      '/styles//default/js/xibo-datasets.js'

    ];
    res.view('signage/library');
  }


};

