/*
 * Copyright 2014 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.help.helpField.directive', [
    require('./helpContents.js'),
    require('./helpContents.registry.js'),
    require('angulartics'),
  ])
  .directive('helpField', function (helpContents, helpContentsRegistry, $analytics) {
    return {
      restrict: 'E',
      templateUrl: require('./helpField.directive.html'),
      scope: {
        key: '@',
        fallback: '@',
        content: '@',
        placement: '@',
        expand: '='
      },
      link: {
        pre: function (scope) {
          function applyContents() {
            if (!scope.content && scope.key) {
              scope.content = helpContentsRegistry.getHelpField(scope.key) || helpContents[scope.key] || scope.fallback;
            }
            scope.contents = {
              content: scope.content,
              placement: scope.placement || 'top'
            };
          }
          applyContents();

          scope.$watch('key', applyContents);
          scope.$watch('fallback', applyContents);
          scope.$watch('content', applyContents);

          let tooltipShownStart = null;

          scope.tooltipShown = () => {
            tooltipShownStart = new Date().getTime();
          };

          scope.tooltipHidden = () => {
            let end = new Date().getTime();
            // only track the event if the tooltip was on the screen for a little while, i.e. it wasn't accidentally
            // moused over
            if (end - tooltipShownStart > 500) {
              $analytics.eventTrack('Help contents viewed', {category: 'Help', label: scope.key || scope.content});
            }
            tooltipShownStart = null;
          };
        }
      }
    };
  });
