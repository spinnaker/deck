import React from 'react';
import { shallow } from 'enzyme';

import {
  mockLoadBalancerDataSourceConfig,
  mockPipelineDataSourceConfig,
  mockServerGroupDataSourceConfig,
} from '@spinnaker/mocks';
import { Application } from '../../application';
import { NavSection } from './NavSection';

describe('NavCategory', () => {
  it('should render multiple categories', () => {
    const app = new Application('testapp', null, [
      mockPipelineDataSourceConfig,
      mockLoadBalancerDataSourceConfig,
      mockServerGroupDataSourceConfig,
    ]);

    const wrapper = shallow(<NavSection app={app} categories={app.dataSources} activeCategoryName={'Pipelines'} />);
    const nodes = wrapper.children();
    expect(nodes.length).toEqual(3);
  });

  it('should not render if no categories', () => {
    const app = new Application('testapp', null, []);

    const wrapper = shallow(<NavSection app={app} categories={[]} activeCategoryName={''} />);
    const nodes = wrapper.children();
    expect(nodes.length).toEqual(0);
  });
});
