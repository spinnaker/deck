import { IQService, module } from 'angular';

import { Application, ApplicationDataSourceRegistry } from 'core/application';
import { ServerGroupManagerReader } from './ServerGroupManagerReader';
import { IServerGroupManager } from 'core/domain/IServerGroupManager';
import { EntityTagsReader } from '../entityTag/EntityTagsReader';

export const SERVER_GROUP_MANAGER_DATA_SOURCE = 'spinnaker.core.serverGroupManager.dataSource';
module(SERVER_GROUP_MANAGER_DATA_SOURCE, []).run(($q: IQService) => {
  'ngInject';

  const loader = (application: Application) =>
    ServerGroupManagerReader.getServerGroupManagersForApplication(application.name);

  const onLoad = (_application: Application, serverGroupManagers: IServerGroupManager[]) =>
    $q.resolve(serverGroupManagers);

  const addTags = (application: Application) => {
    EntityTagsReader.addTagsToServerGroupManagers(application);
  };

  ApplicationDataSourceRegistry.registerDataSource({
    key: 'serverGroupManagers',
    visible: false,
    loader,
    onLoad,
    afterLoad: addTags,
  });
});
