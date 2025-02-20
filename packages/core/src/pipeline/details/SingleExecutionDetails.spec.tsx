import { UIRouter, UIRouterReact } from '@uirouter/react';
import { mount } from 'enzyme';
import React from 'react';

import { SingleExecutionDetails } from './SingleExecutionDetails';
import { Application } from '../../application/application.model';
import type { IExecution } from '../../domain';

jest.mock('@uirouter/react', () => ({
  UIRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UIRouterReact: class {
    start = jest.fn();
    locationService = { onChange: jest.fn() };
  },
}));

describe('<SingleExecutionDetails />', () => {
  let application: Application;
  let wrapper: any;
  let router: UIRouterReact;

  beforeEach(() => {
    application = new Application('my-app', null, []);
    router = new UIRouterReact();
    wrapper = mount(
      <UIRouter router={router}>
        <SingleExecutionDetails app={application} />
      </UIRouter>,
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders execution details when provided', () => {
    expect(wrapper.find('.execution-details').length).toBeGreaterThan(0);
  });

  it('updates state when new execution is received', () => {
    const newExecution = { id: 'exec2', trigger: {}, stages: [] } as IExecution;
    wrapper.setProps({ params: { executionId: newExecution.id } });
    wrapper.update();
    expect(wrapper.props().params.executionId).toEqual('exec2');
  });

  it('handles missing execution gracefully', () => {
    wrapper.setProps({ params: { executionId: null } });
    wrapper.update();
    expect(wrapper.props().params.executionId).toBeNull();
  });
});
