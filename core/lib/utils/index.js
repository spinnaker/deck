const angular = require('angular');

module.exports = angular.module('spinnaker.core.utils', [
  require('./appendTransform.js'),
  require('./d3.js'),
  require('./dataConverter.service.js'),
  require('./jQuery.js'),
  require('./lodash.js'),
  require('./moment.js'),
  require('./rx.js'),
  require('./selectOnDblClick.directive.js'),
  require('./timeFormatters.js'),
  require('./timePicker.service.js'),
  require('./uuid.service.js'),

]);
