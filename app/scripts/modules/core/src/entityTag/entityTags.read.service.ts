import { module, IQService, IPromise } from 'angular';

import { API_SERVICE, Api } from 'core/api/api.service';
import { IEntityTags, IEntityTag, ICreationMetadataTag } from '../domain/IEntityTags';
import { Application } from 'core/application/application.model';
import { IServerGroup, ILoadBalancer, ISecurityGroup } from 'core/domain';
import { SETTINGS } from 'core/config/settings';

export class EntityTagsReader {

  constructor(private API: Api,
              private $q: IQService) {
    'ngInject';
  }

  public getAllEntityTagsForApplication(application: string): IPromise<IEntityTags[]> {
    return this.API.one('tags').withParams({ application }).getList()
      .then((allTags: IEntityTags[]) => this.flattenTagsAndAddMetadata(allTags))
  }

  public addTagsToServerGroups(application: Application): void {
    if (!SETTINGS.feature.entityTags) {
      return;
    }
    const allTags = application.getDataSource('entityTags').data;
    const serverGroupTags: IEntityTags[] = allTags.filter(t => t.entityRef.entityType === 'servergroup');
    const clusterTags: IEntityTags[] = allTags.filter(t => t.entityRef.entityType === 'cluster');
    application.getDataSource('serverGroups').data.forEach((serverGroup: IServerGroup) => {
      serverGroup.entityTags = serverGroupTags.find(t => t.entityRef.entityId === serverGroup.name &&
        t.entityRef.account === serverGroup.account &&
        t.entityRef.region === serverGroup.region);
      serverGroup.clusterEntityTags = clusterTags.filter(t => t.entityRef.entityId === serverGroup.cluster &&
        (t.entityRef.account === '*' || t.entityRef.account === serverGroup.account) &&
        (t.entityRef.region === '*' || t.entityRef.region === serverGroup.region));
    });
  }

  public addTagsToLoadBalancers(application: Application): void {
    if (!SETTINGS.feature.entityTags) {
      return;
    }
    const allTags = application.getDataSource('entityTags').data;
    const serverGroupTags: IEntityTags[] = allTags.filter(t => t.entityRef.entityType === 'loadbalancer');
    application.getDataSource('loadBalancers').data.forEach((loadBalancer: ILoadBalancer) => {
      loadBalancer.entityTags = serverGroupTags.find(t => t.entityRef.entityId === loadBalancer.name &&
        t.entityRef.account === loadBalancer.account &&
        t.entityRef.region === loadBalancer.region);
    });
  }

  public addTagsToSecurityGroups(application: Application): void {
    if (!SETTINGS.feature.entityTags) {
      return;
    }
    const allTags = application.getDataSource('entityTags').data;
    const securityGroupTags: IEntityTags[] = allTags.filter(t => t.entityRef.entityType === 'securitygroup');
    application.getDataSource('securityGroups').data.forEach((securityGroup: ISecurityGroup) => {
      securityGroup.entityTags = securityGroupTags.find(t => t.entityRef.entityId === securityGroup.name &&
        t.entityRef.account === securityGroup.account &&
        t.entityRef.region === securityGroup.region);
    });
  }

  public getEntityTagsForId(entityType: string, entityId: string): IPromise<IEntityTags[]> {
    if (!entityId) {
      return this.$q.when([]);
    }
    return this.API.one('tags')
      .withParams({
        entityType: entityType.toLowerCase(),
        entityId: entityId,
      }).getList().then((entityTagGroups: IEntityTags[]) => {
        return this.flattenTagsAndAddMetadata(entityTagGroups);
      })
      .catch(() => {
        return this.$q.when([]);
      });
  }

  private flattenTagsAndAddMetadata(entityTags: IEntityTags[]): IEntityTags[] {
    const allTags: IEntityTags[] = [];
    entityTags.forEach(entityTag => {
      entityTag.tags.forEach(tag => this.addTagMetadata(entityTag, tag));
      entityTag.alerts = entityTag.tags.filter(t => t.name.startsWith('spinnaker_ui_alert:'));
      entityTag.notices = entityTag.tags.filter(t => t.name.startsWith('spinnaker_ui_notice:'));
      entityTag.creationMetadata = entityTag.tags.find(t => t.name === 'spinnaker:metadata') as ICreationMetadataTag;
      allTags.push(entityTag);
    });
    return allTags;
  }

  private addTagMetadata(entityTag: IEntityTags, tag: IEntityTag): void {
    const metadata = entityTag.tagsMetadata.find(m => m.name === tag.name);
    if (metadata) {
      tag.created = metadata.created;
      tag.createdBy = metadata.createdBy;
      tag.lastModified = metadata.lastModified;
      tag.lastModifiedBy = metadata.lastModifiedBy;
    }
  }
}

export const ENTITY_TAGS_READ_SERVICE = 'spinnaker.core.entityTag.read.service';
module(ENTITY_TAGS_READ_SERVICE, [
  API_SERVICE,
]).service('entityTagsReader', EntityTagsReader);
