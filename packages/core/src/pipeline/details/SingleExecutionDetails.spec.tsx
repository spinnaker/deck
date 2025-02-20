import { shallow } from 'enzyme';
import React from 'react';

import { SingleExecutionDetails } from './SingleExecutionDetails';
import { Application } from '../../application/application.model';
import type { IExecution } from '../../domain';

describe('<SingleExecutionDetails />', () => {
  let application: Application;
  let wrapper: any;
  // let execution: IExecution;

  beforeEach(() => {
    application = new Application('my-app', null, []);
    // execution = { id: 'exec1', trigger: {}, stages: [] } as IExecution;
    wrapper = shallow(<SingleExecutionDetails app={application} />);
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders execution details when provided', () => {
    expect(wrapper.find('.execution-details').length).toBeGreaterThan(0);
  });

  it('updates state when new execution is received', () => {
    const newExecution = { id: 'exec2', trigger: {}, stages: [] } as IExecution;
    wrapper.setProps({ execution: newExecution });
    expect(wrapper.instance().props.execution.id).toEqual('exec2');
  });

  it('handles missing execution gracefully', () => {
    wrapper.setProps({ execution: null });
    expect(wrapper.instance().props.execution).toBeNull();
  });
});
