'use strict';

import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import './help/tencentcloud.help';
import { TencentcloudImageReader } from './image';
import { TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';
import { TENCENTCLOUD_REACT_MODULE } from './reactShims/tencentcloud.react.module';
import './validation/ApplicationNameValidator';
import { CreateSecurityGroupModal, SecurityGroupDetail } from './securityGroup';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENTCLOUD_MODULE = 'spinnaker.tencentcloud';
module(TENCENTCLOUD_MODULE, [TENCENTCLOUD_REACT_MODULE, TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER]).config(() => {
  CloudProviderRegistry.registerProvider('tencentcloud', {
    name: 'tencentcloud',
    logo: {
      path: require('./logo/tencentcloud.logo.svg'),
    },
    image: {
      reader: TencentcloudImageReader,
    },
    securityGroup: {
      CreateSecurityGroupModal,
      details: SecurityGroupDetail,
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencentcloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
