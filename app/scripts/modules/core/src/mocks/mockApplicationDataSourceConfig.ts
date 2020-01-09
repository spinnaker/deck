import { $q } from 'ngimport';
import { Application, IDataSourceConfig } from '../application';

export const mockApplicationDataSourceConfig: IDataSourceConfig<any> = {
  activeState: '**.pipelines.**',
  afterLoad: (application: Application) => application,
  autoActivate: false,
  badge: 'runningExecutions',
  credentialsField: 'test',
  description: 'test description',
  icon: 'fa fa-xs fa-fw fa-list',
  key: 'test',
  label: 'Pipelines',
  lazy: true,
  loader: (application: Application) => $q(() => application),
  onLoad: (application: Application) => $q(() => application),
  optIn: false,
  optional: true,
  hidden: false,
  primary: true,
  providerField: 'provider',
  regionField: 'region',
  requireConfiguredApp: false,
  sref: 'pipelines.executions',
  visible: true,
  requiresDataSource: 'true',
  category: 'delivery',
  defaultData: [],
};
