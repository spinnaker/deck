'use strict';


angular.module('deckApp')
  .filter('duration', function() {
    return function(input) {
      return moment.duration(input).humanize();
    };
  });
