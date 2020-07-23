'use strict';

import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import './help/tencentcloud.help';
import { TencentcloudImageReader } from './image';
import { TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';
import { TENCENTCLOUD_REACT_MODULE } from './reactShims/tencentcloud.react.module';
import { TENCENTCLOUD_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';

import './validation/ApplicationNameValidator';
import { LoadBalancerDetails } from './loadBalancer/details/loadBalancerDetails';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { TencentcloudLoadBalancerClusterContainer } from './loadBalancer/TencentcloudLoadBalancerClusterContainer';
import { TencentcloudLoadBalancersTag } from './loadBalancer/TencentcloudLoadBalancersTag';

import tencentcloudLogo from './logo/tencentcloud.logo.svg';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENTCLOUD_MODULE = 'spinnaker.tencentcloud';
module(TENCENTCLOUD_MODULE, [
  TENCENTCLOUD_REACT_MODULE,
  TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER,
  TENCENTCLOUD_LOAD_BALANCER_MODULE,
]).config(() => {
  CloudProviderRegistry.registerProvider('tencentcloud', {
    name: 'tencentcloud',
    logo: {
      path: tencentcloudLogo,
    },
    image: {
      reader: TencentcloudImageReader,
    },
    loadBalancer: {
      transformer: 'tencentcloudLoadBalancerTransformer',
      details: LoadBalancerDetails,
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      ClusterContainer: TencentcloudLoadBalancerClusterContainer,
      LoadBalancersTag: TencentcloudLoadBalancersTag,
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencentcloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
