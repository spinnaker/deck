import { module, IQService } from 'angular';
import { APPLICATION_DATA_SOURCE_REGISTRY, ApplicationDataSourceRegistry } from '../application/service/applicationDataSource.registry';
import { ENTITY_TAGS_READ_SERVICE, EntityTagsReader } from '../entityTag/entityTags.read.service';
import { CLUSTER_SERVICE, ClusterService } from 'core/cluster/cluster.service';
import { JSON_UTILITY_SERVICE, JsonUtilityService } from 'core/utils/json/json.utility.service';
import { Application } from 'core/application/application.model';
import { IServerGroup } from 'core/domain';

export const SERVER_GROUP_DATA_SOURCE = 'spinnaker.core.serverGroup.dataSource';

module(SERVER_GROUP_DATA_SOURCE, [
    APPLICATION_DATA_SOURCE_REGISTRY,
    ENTITY_TAGS_READ_SERVICE,
    CLUSTER_SERVICE,
    JSON_UTILITY_SERVICE,
  ])
  .run(($q: IQService,
        applicationDataSourceRegistry: ApplicationDataSourceRegistry,
        clusterService: ClusterService,
        entityTagsReader: EntityTagsReader,
        jsonUtilityService: JsonUtilityService) => {

    const loadServerGroups = (application: Application) => {
      return clusterService.loadServerGroups(application);
    };

    const addServerGroups = (application: Application, serverGroups: IServerGroup[]) => {
      serverGroups.forEach(serverGroup => serverGroup.stringVal =
        jsonUtilityService.makeSortedStringFromAngularObject(serverGroup, ['executions', 'runningTasks']));
      application.clusters = clusterService.createServerGroupClusters(serverGroups);
      const data = clusterService.addServerGroupsToApplication(application, serverGroups);
      clusterService.addTasksToServerGroups(application);
      clusterService.addExecutionsToServerGroups(application);
      return $q.when(data);
    };

    const addTags = (application: Application) => {
      entityTagsReader.addTagsToServerGroups(application);
    };

    applicationDataSourceRegistry.registerDataSource({
      key: 'serverGroups',
      label: 'Clusters',
      sref: '.insight.clusters',
      optional: true,
      primary: true,
      icon: 'th-large',
      loader: loadServerGroups,
      onLoad: addServerGroups,
      afterLoad: addTags,
      providerField: 'type',
      credentialsField: 'account',
      regionField: 'region',
      description: 'Collections of server groups or jobs'
    });
  });
