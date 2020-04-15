import { IQService, module } from 'angular';

import { noop } from 'core/utils';
import { SETTINGS } from 'core/config/settings';
import { ApplicationDataSourceRegistry } from 'core/application/service/ApplicationDataSourceRegistry';
import { Application, DELIVERY_KEY } from 'core/application';
import { IManagedApplicationSummary } from 'core/domain';
import { ManagedReader } from './ManagedReader';
import {
  addManagedResourceMetadataToServerGroups,
  addManagedResourceMetadataToLoadBalancers,
  addManagedResourceMetadataToSecurityGroups,
} from './managedResourceDecorators';

export const MANAGED_RESOURCES_DATA_SOURCE = 'spinnaker.core.managed.dataSource';
module(MANAGED_RESOURCES_DATA_SOURCE, []).run([
  '$q',
  ($q: IQService) => {
    if (!SETTINGS.feature.managedResources) {
      return;
    }
    const loadManagedResources = (application: Application) => {
      return ManagedReader.getApplicationSummary(application.name);
    };

    const addManagedResources = (application: Application, data: IManagedApplicationSummary) => {
      application.isManagementPaused = data.applicationPaused;
      return $q.when(data);
    };

    const addManagedMetadataToResources = (application: Application) => {
      application.serverGroups.ready().then(() => addManagedResourceMetadataToServerGroups(application), noop);
      application.loadBalancers.ready().then(() => addManagedResourceMetadataToLoadBalancers(application), noop);
      application.securityGroups.ready().then(() => addManagedResourceMetadataToSecurityGroups(application), noop);
    };

    const loadEnvironments = (application: Application) => {
      return ManagedReader.getEnvironmentsSummary(application.name);
    };

    const addEnvironments = (
      _application: Application,
      data: IManagedApplicationSummary<'resources' | 'artifacts' | 'environments'>,
    ) => {
      return $q.when(data);
    };

    ApplicationDataSourceRegistry.registerDataSource({
      key: 'managedResources',
      visible: false,
      loader: loadManagedResources,
      onLoad: addManagedResources,
      afterLoad: addManagedMetadataToResources,
      defaultData: { applicationPaused: false, hasManagedResources: false, resources: [] },
    });

    ApplicationDataSourceRegistry.registerDataSource({
      key: 'environments',
      sref: '.environments',
      category: DELIVERY_KEY,
      optional: true,
      optIn: true,
      hidden: true,
      icon: 'fa fa-fw fa-xs fa-code-branch',
      iconName: 'spCIBranch',
      loader: loadEnvironments,
      onLoad: addEnvironments,
      defaultData: {
        applicationPaused: false,
        hasManagedResources: false,
        environments: [],
        artifacts: [],
        resources: [],
      },
    });
  },
]);
