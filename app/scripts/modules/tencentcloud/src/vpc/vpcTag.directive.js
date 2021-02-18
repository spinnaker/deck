'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

export const TENCENTCLOUD_VPC_VPCTAG_DIRECTIVE = 'spinnaker.tencentcloud.vpc.tag.directive';
angular.module(TENCENTCLOUD_VPC_VPCTAG_DIRECTIVE, []).directive('tencentcloudVpcTag', function() {
  return {
    restrict: 'E',
    scope: {
      vpcId: '=',
    },
    template: '<span class="vpc-tag">{{vpcLabel}}</span>',
    link: function(scope) {
      function applyLabel() {
        if (!scope.vpcId) {
          scope.vpcLabel = 'None ';
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
