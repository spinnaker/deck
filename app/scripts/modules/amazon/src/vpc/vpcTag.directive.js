'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

module.exports = angular.module('spinnaker.amazon.vpc.tag.directive', []).directive('vpcTag', function() {
  return {
    restrict: 'E',
    scope: {
      vpcId: '=',
    },
    template: '<span class="vpc-tag">{{vpcLabel}}</span>',
    link: function(scope) {
      function applyLabel() {
        if (!scope.vpcId) {
          scope.vpcLabel = 'None (EC2 Classic)';
        } else {
          VpcReader.getVpcName(scope.vpcId).then(function(name) {
            scope.vpcLabel = '(' + scope.vpcId + ')';

            if (name) {
              scope.vpcLabel = name + ' ' + scope.vpcLabel;
            }
          });
        }
      }

      scope.$watch('vpcId', applyLabel, true);
    },
  };
});
