'use strict';

import { module } from 'angular';
import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';
import { TENCENTCLOUD_REACT_MODULE } from './reactShims/tencentcloud.react.module';
import { CreateSecurityGroupModal, SecurityGroupDetail } from './securityGroup';
import { TencentcloudImageReader } from './image';
import tencentcloudLogo from './logo/tencentcloud.logo.svg';
import './validation/ApplicationNameValidator';
import './help/tencentcloud.help';
import './logo/tencentcloud.logo.less';

export const TENCENTCLOUD_MODULE = 'spinnaker.tencentcloud';
module(TENCENTCLOUD_MODULE, [TENCENTCLOUD_REACT_MODULE, TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER]).config(() => {
  CloudProviderRegistry.registerProvider('tencentcloud', {
    name: 'Tencentcloud',
    logo: {
      path: tencentcloudLogo,
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
