'use strict';

/*
  This is a hacked version of https://github.com/sroze/ngInfiniteScroll
  extracted entirely from this Plunkr: http://plnkr.co/edit/OwhFCyHz0mO1yZMj5UW5?p=preview
  based on this comment https://github.com/angular-ui/ui-select/issues/389#issuecomment-95295234

  This is what using ui-select has done to us.
 */

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.utils.infiniteScroll.directive', [])
  .directive('infiniteScroll', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
        $window = angular.element($window);
        elem.css('overflow-y', 'auto');
        elem.css('overflow-x', 'hidden');
        elem.css('height', 'inherit');
        scrollDistance = 0;
        if (attrs.infiniteScrollDistance != null) {
          scope.$watch(attrs.infiniteScrollDistance, function(value) {
            return (scrollDistance = parseInt(value, 10));
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled != null) {
          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        $rootScope.$on('refreshStart', function () {
          elem.animate({ scrollTop: '0' });
        });
        handler = function() {
          var container, elementBottom, remaining, shouldScroll, containerBottom;
          container = $(elem.children()[0]);
          elementBottom = elem.offset().top + elem.height();
          containerBottom = container.offset().top + container.height();
          remaining = containerBottom - elementBottom;
          shouldScroll = remaining <= elem.height() * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.infiniteScroll);
            } else {
              return scope.$apply(attrs.infiniteScroll);
            }
          } else if (shouldScroll) {
            return (checkWhenEnabled = true);
          }
        };
        elem.on('scroll', handler);
        scope.$on('$destroy', function() {
          return $window.off('scroll', handler);
        });
        return $timeout((function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }), 0);
      }
    };
  }
);
