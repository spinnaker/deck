import { mock, IQService, IScope } from 'angular';
import * as React from 'react';
import { ReactWrapper, mount } from 'enzyme';

import { Application } from 'core/application/application.model';
import { APPLICATION_MODEL_BUILDER, ApplicationModelBuilder } from 'core/application/applicationModel.builder';
import { ILoadBalancersTagProps } from './LoadBalancersTagWrapper';
import { LoadBalancersTag } from './LoadBalancersTag';
import { IServerGroup } from 'core/domain';
import { HoverablePopover } from 'core/presentation';

describe('<LoadBalancersTag />', () => {
  const lb1 = { name: 'lb1', account: 'prod', region: 'us-east-1', vpcId: 'vpc-1' };
  const lb2 = { name: 'lb2', account: 'prod', region: 'us-east-1' };

  let $q: IQService, $scope: IScope, application: Application, component: ReactWrapper<ILoadBalancersTagProps, any>;

  beforeEach(mock.module(APPLICATION_MODEL_BUILDER));

  beforeEach(
    mock.inject((_$q_: IQService, $rootScope: IScope, applicationModelBuilder: ApplicationModelBuilder) => {
      $q = _$q_;
      $scope = $rootScope.$new();
      application = applicationModelBuilder.createApplicationForTests('app', {
        key: 'loadBalancers',
        loader: () => $q.resolve(application.loadBalancers.data),
        onLoad: (_app, data) => $q.resolve(data),
      });
      application.loadBalancers.refresh();
      $scope.$digest();
    }),
  );

  it('extracts single load balancer from data', () => {
    const serverGroup = {
      account: 'prod',
      region: 'us-east-1',
      type: 'aws',
      loadBalancers: ['lb1'],
      instances: [],
    } as IServerGroup;

    application.getDataSource('loadBalancers').data = [lb1, lb2];

    const props: ILoadBalancersTagProps = { application, serverGroup };
    component = mount(<LoadBalancersTag {...props} />);

    $scope.$digest();
    expect(component.render().find('span.btn-load-balancer').length).toBe(1);
  });

  it('extracts two load balancers from data', done => {
    const serverGroup = {
      account: 'prod',
      region: 'us-east-1',
      type: 'aws',
      loadBalancers: ['lb1', 'lb2'],
      instances: [],
    } as IServerGroup;

    application.getDataSource('loadBalancers').data = [lb1, lb2];

    const props: ILoadBalancersTagProps = { application, serverGroup };
    const popoverContainerEl = document.createElement('div');
    component = mount(<LoadBalancersTag {...props} container={popoverContainerEl} />);

    // Make sure the application dataSource promises resolve
    $scope.$digest();

    component.update();
    const popover = component.find(HoverablePopover);
    expect(popover.length).toBe(1);

    popover.instance().setState({ popoverIsOpen: true, animation: false });
    // Wait for the popover to show
    setTimeout(() => {
      const menuChildren = popoverContainerEl.querySelector('.popover-content div.menu-load-balancers').children;

      expect(menuChildren.length).toBe(3);
      expect(menuChildren[0].textContent.trim()).toBe('Load Balancers');
      expect(menuChildren[1].textContent.trim()).toBe('lb1');
      expect(menuChildren[2].textContent.trim()).toBe('lb2');

      done();
    });
  });
});
