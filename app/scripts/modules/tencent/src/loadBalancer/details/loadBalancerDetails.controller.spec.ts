import { IControllerService, IRootScopeService, mock } from 'angular';
import { StateService } from '@uirouter/core';

import { ApplicationModelBuilder } from '@spinnaker/core';

import {
  TENCENT_LOAD_BALANCER_DETAILS_CTRL,
  TencentLoadBalancerDetailsController,
} from './loadBalancerDetails.controller';

describe('Controller: LoadBalancerDetailsCtrl', function() {
  let controller: TencentLoadBalancerDetailsController;
  let $scope;
  let $state;
  const loadBalancer = {
    name: 'foo',
    region: 'us-west-1',
    account: 'test',
    accountId: 'test',
    vpcId: '1',
  };

  beforeEach(mock.module(TENCENT_LOAD_BALANCER_DETAILS_CTRL));

  beforeEach(
    mock.inject(($controller: IControllerService, $rootScope: IRootScopeService, _$state_: StateService) => {
      $scope = $rootScope.$new();
      $state = _$state_;
      const app = ApplicationModelBuilder.createApplicationForTests('app', {
        defaultData: undefined,
        key: 'loadBalancers',
        lazy: true,
      });
      app.loadBalancers.data.push(loadBalancer);
      controller = $controller(TencentLoadBalancerDetailsController, {
        $scope,
        loadBalancer,
        app,
        $state,
      });
    }),
  );

  it('should have an instantiated controller', function() {
    expect(controller).toBeDefined();
  });
});
