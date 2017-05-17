import { module } from 'angular';
import { compact, flatten, uniq } from 'lodash';
import { IInstance, IServerGroup } from 'core/domain';
import { Application } from '../application.model';

export interface IServerGroupFilter {
  (s: IServerGroup): boolean;
}

export interface IInstanceFilter {
  (i: IInstance): boolean;
}

const defaultFilter = () => true;

export class AppListExtractor {

  public getRegions(applications: Application[], filter: IServerGroupFilter = defaultFilter): string[] {
    const allRegions: string[][] = applications.map(a => a.getDataSource('serverGroups').data
      .filter(filter)
      .map((serverGroup: IServerGroup) => serverGroup.region));
    return uniq(compact(flatten(allRegions))).sort();
  }

  public getStacks(applications: Application[], filter: IServerGroupFilter = defaultFilter): string[] {
    const allStacks: string[][] = applications.map(a => a.getDataSource('serverGroups').data
      .filter(filter)
      .map((serverGroup: IServerGroup) => serverGroup.stack));
    return uniq(compact(flatten(allStacks))).sort();
  }

  public getClusters(applications: Application[], filter: IServerGroupFilter = defaultFilter): string[] {
    const allClusters: string[][] = applications.map(a => a.getDataSource('serverGroups').data
      .filter(filter)
      .map((serverGroup: IServerGroup) => serverGroup.cluster));
    return uniq(compact(flatten(allClusters))).sort();
  }

  public getAsgs(applications: Application[], clusterFilter: IServerGroupFilter = defaultFilter): string[] {
    const allNames: string[][] = applications.map(a => a.getDataSource('serverGroups').data
      .filter(clusterFilter).map((s: IServerGroup) => s.name));
    return uniq(compact(flatten(allNames))).sort();
  }

  public getZones(applications: Application[],
                  clusterFilter: IServerGroupFilter = defaultFilter,
                  regionFilter: IServerGroupFilter = defaultFilter,
                  nameFilter: IServerGroupFilter = defaultFilter): string[] {
    const allInstances: IInstance[][][] = applications.map(a => a.getDataSource('serverGroups').data
      .filter(clusterFilter)
      .filter(regionFilter)
      .filter(nameFilter)
      .map((serverGroup: IServerGroup) => serverGroup.instances));

    const instanceZones: string[] = flatten(flatten(allInstances))
      .map((i: IInstance) => i.availabilityZone);

    return uniq(compact(instanceZones)).sort();
  }

  public getInstances(applications: Application[],
                      clusterFilter: IServerGroupFilter = defaultFilter,
                      serverGroupFilter: IServerGroupFilter = defaultFilter,
                      instanceFilter: IInstanceFilter = defaultFilter): IInstance[] {

    const allInstances: IInstance[][][] = applications.map(a => a.getDataSource('serverGroups').data
      .filter(clusterFilter)
      .filter(serverGroupFilter)
      .map((serverGroup: IServerGroup) => serverGroup.instances));

    return uniq(compact(flatten(flatten(allInstances)).filter(instanceFilter)));
  }

  // filter builders

  public clusterFilterForCredentials(credentials: string): IServerGroupFilter {
    return (serverGroup: IServerGroup) => {
      return credentials ? serverGroup.account === credentials : true;
    };
  }

  public clusterFilterForCredentialsAndRegion(credentials: string, region: string | string[]): IServerGroupFilter {
    return (serverGroup: IServerGroup) => {
      const accountMatches = credentials ? serverGroup.account === credentials : true;

      const regionMatches = serverGroup && Array.isArray(region) && region.length ?
        region.includes(serverGroup.region) :
          region ? serverGroup.region === region :
            true;

      return accountMatches && regionMatches;
    };
  }
}

export const LIST_EXTRACTOR_SERVICE = 'spinnaker.core.listExtractor.service';
module(LIST_EXTRACTOR_SERVICE, []).service('appListExtractorService', AppListExtractor);
