// import { SchedulerFactory } from 'core/scheduler/SchedulerFactory';
import { Application, ApplicationDataSource, ApplicationModelBuilder } from 'core/application';
import { mockApplicationDataSourceConfig } from './mockApplicationDataSourceConfig';
import { IServerGroup } from 'core/domain';
// export const mockApplication = new Application('mock', null, []);

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
// export const mockApplicationDataSource = new ApplicationDataSource(mockApplicationDataSourceConfig, mockApplication);
export const mockApplication = ApplicationModelBuilder.createApplicationForTests('app', {
  key: 'serverGroups',
  loaded: true,
  data: [
    createServerGroup('account-name-one', 'app-stack-detailOne', 'app', 'region-one'),
    createServerGroup('account-name-two', 'app-stack-detailTwo', 'app', 'region-two'),
    createServerGroup('account-name-one', 'app-stack-detailOne', 'app', 'region-three'),
    createServerGroup('account-name-one', 'app-stack-detailThree', 'app', 'region-one'),
    createServerGroup('account-name-one', 'app-stack-detailFour', 'app', 'region-three'),
    createServerGroup('account-name-one', 'app-stack-detailFive', 'app', 'region-two'),
  ],
  defaultData: [] as IServerGroup[],
} as ApplicationDataSource<IServerGroup[]>);
const mockServerGroupDataSource = {
  key: 'serverGroups',
  loaded: true,
  data: [
    createServerGroup('account-name-one', 'app-stack-detailOne', 'app', 'region-one'),
    createServerGroup('account-name-two', 'app-stack-detailTwo', 'app', 'region-two'),
    createServerGroup('account-name-one', 'app-stack-detailOne', 'app', 'region-three'),
    createServerGroup('account-name-one', 'app-stack-detailThree', 'app', 'region-one'),
    createServerGroup('account-name-one', 'app-stack-detailFour', 'app', 'region-three'),
    createServerGroup('account-name-one', 'app-stack-detailFive', 'app', 'region-two'),
  ],
  defaultData: [] as IServerGroup[],
};
