import { module, IQService } from 'angular';

import { noop } from 'core/utils';
import { SETTINGS } from 'core/config/settings';
import { ApplicationDataSourceRegistry } from 'core/application/service/ApplicationDataSourceRegistry';
import { Application } from 'core/application';
import { ManagedReader, IManagedApplicationSummary } from './ManagedReader';
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

    const addManagedResources = (_application: Application, data: IManagedApplicationSummary) => {
      return $q.when(data);
    };

    const addManagedMetadataToResources = (application: Application) => {
      application.serverGroups.ready().then(() => addManagedResourceMetadataToServerGroups(application), noop);
      application.loadBalancers.ready().then(() => addManagedResourceMetadataToLoadBalancers(application), noop);
      application.securityGroups.ready().then(() => addManagedResourceMetadataToSecurityGroups(application), noop);
    };

    ApplicationDataSourceRegistry.registerDataSource({
      key: 'managedResources',
      visible: false,
      loader: loadManagedResources,
      onLoad: addManagedResources,
      afterLoad: addManagedMetadataToResources,
      defaultData: { hasManagedResources: false, resources: [] },
    });
  },
]);
