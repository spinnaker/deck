'use strict';

const angular = require('angular');

import {SECURITY_GROUP_STATES} from './securityGroup.states';
import {SECURITY_GROUP_FILTER} from './filter/securityGroup.filter.component';
import './SecurityGroupSearchResultFormatter';

module.exports = angular
  .module('spinnaker.core.securityGroup', [
    require('./AllSecurityGroupsCtrl.js').name,
    SECURITY_GROUP_FILTER,
    require('./securityGroup.pod.directive.js').name,
    require('./securityGroup.directive.js').name,
    require('./securityGroup.dataSource').name,
    SECURITY_GROUP_STATES,
  ]);
