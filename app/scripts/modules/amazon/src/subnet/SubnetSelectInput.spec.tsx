import React from 'react';
import { shallow } from 'enzyme';
import { mock, IScope } from 'angular';
import { SubnetSelectInput } from './SubnetSelectInput';
import {
  mockApplication,
  mockApplicationDataSourceConfig,
  mockSubnet,
  mockApplicationDataSource,
  generateMockApplicationByDataSource,
} from 'core/mocks';
import { Application, ApplicationModelBuilder, ApplicationDataSource } from 'core/application';
import { REACT_MODULE } from 'core/reactShims';
import { IServerGroup } from 'core/domain';

// Selectable state
const INPUT_PROPS = {
  value: 'test',
  onChange: () => {},
  application: new Application('testapp', null, []),
  readOnly: false,
  hideClassic: false,
  subnets: [
    {
      availabilityZone: 'us-west-1b',
      id: 'subnet-f7af8783',
      name: 'test-subnet',
      account: 'test',
      region: 'us-west-1',
      type: 'aws',
      label: 'label',
      purpose: 'testing subnets',
      deprecated: false,
      vpcId: 'vpc-9af769ff',
    },
  ],
  region: 'us-east-1',
  credentials: 'test_credentials',
};

// Read only state, with value
const READ_ONLY_PROPS = {
  ...INPUT_PROPS,
  readOnly: true,
};

// Read only state with null value
const NULL_VALUE_PROPS = {
  ...READ_ONLY_PROPS,
  value: '',
};

describe('SubnetSelectInput', () => {
  let application: Application;
  let $scope: IScope;

  function createServerGroup(account: string, cluster: string, name: string, region: string): IServerGroup {
    return {
      account,
      cloudProvider: 'cloud-provider',
      cluster,
      name,
      region,
      instances: [{ health: null, id: 'instance-id', launchTime: 0, name: 'instance-name', zone: 'GMT' }],
      instanceCounts: { up: 1, down: 0, starting: 0, succeeded: 1, failed: 0, unknown: 0, outOfService: 0 },
      moniker: { app: 'my-app', cluster, detail: 'my-detail', stack: 'my-stack', sequence: 1 },
    } as IServerGroup;
  }

  beforeEach(mock.module(REACT_MODULE));
  beforeEach(
    mock.inject(($rootScope: IScope) => {
      $scope = $rootScope.$new();
      application = mockApplication;
      // application = ApplicationModelBuilder.createApplicationForTests('app', {
      //   key: 'serverGroups',
      //   loaded: true,
      //   data: [
      //     createServerGroup('account-name-one', 'app-stack-detailOne', 'app', 'region-one'),
      //     createServerGroup('account-name-two', 'app-stack-detailTwo', 'app', 'region-two'),
      //     createServerGroup('account-name-one', 'app-stack-detailOne', 'app', 'region-three'),
      //     createServerGroup('account-name-one', 'app-stack-detailThree', 'app', 'region-one'),
      //     createServerGroup('account-name-one', 'app-stack-detailFour', 'app', 'region-three'),
      //     createServerGroup('account-name-one', 'app-stack-detailFive', 'app', 'region-two'),
      //   ],
      //   defaultData: [] as IServerGroup[],
      // } as ApplicationDataSource<IServerGroup[]>);
      // application = generateMockApplicationByDataSource('testapp', 'serverGroups');
    }),
  );
  console.log(application, $scope);

  it('should render an input', () => {
    const wrapper = shallow(<SubnetSelectInput {...INPUT_PROPS} />);
    const input = wrapper.find('SelectInput');
    const paragraph = wrapper.find('p');
    expect(input.length).toBeTruthy();
    expect(paragraph.length).toBeFalsy();
  });

  it('should generate options', () => {
    const wrapper = shallow<SubnetSelectInput>(<SubnetSelectInput {...INPUT_PROPS} />);
    expect(wrapper.state().options.length).toBeGreaterThan(0);
  });
});

describe('SubnetSelectInput read only', () => {
  it('should render the value', () => {
    const wrapper = shallow(<SubnetSelectInput {...READ_ONLY_PROPS} />);

    const input = wrapper.find('SelectInput');
    const paragraph = wrapper.find('p');
    expect(input.length).toBeFalsy();
    expect(paragraph.length).toBeTruthy();
    expect(paragraph.text()).toEqual(READ_ONLY_PROPS.value);
  });

  it('should render the default value', () => {
    const wrapper = shallow(<SubnetSelectInput {...NULL_VALUE_PROPS} />);
    const input = wrapper.find('SelectInput');
    const paragraph = wrapper.find('p');
    expect(input.length).toBeFalsy();
    expect(paragraph.length).toBeTruthy();
    expect(paragraph.text()).toEqual('None (EC2 Classic)');
  });
});
