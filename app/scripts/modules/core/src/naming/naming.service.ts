import {module} from 'angular';

export interface IComponentName {
  application: string;
  stack: string;
  freeFormDetails: string;
  cluster: string;
}

export class NamingService {
  public static VERSION_PATTERN: RegExp = /(v\d{3})/;

  public parseServerGroupName(serverGroupName: string): IComponentName {
    const result: IComponentName = {
      application: '',
      stack: '',
      freeFormDetails: '',
      cluster: '',
    };

    if (!serverGroupName) {
      return result;
    }
    const split: string[] = serverGroupName.split('-'),
          isVersioned = NamingService.VERSION_PATTERN.test(split[split.length - 1]);

    result.application = split[0];

    if (isVersioned) {
      split.pop();
    }

    if (split.length > 1) {
      result.stack = split[1];
    }
    if (split.length > 2) {
      result.freeFormDetails = split.slice(2, split.length).join('-');
    }
    result.cluster = this.getClusterNameFromServerGroupName(serverGroupName);

    return result;
  }

  public parseClusterName(clusterName: string): IComponentName {
    return this.parseServerGroupName(clusterName);
  }

  public getClusterName(app: string, stack: string, detail: string): string {
    let clusterName = app;
    if (stack) {
      clusterName += `-${stack}`;
    }
    if (!stack && detail) {
      clusterName += `-`;
    }
    if (detail) {
      clusterName += `-${detail}`;
    }
    return clusterName;
  }

  public getClusterNameFromServerGroupName(serverGroupName: string): string {
    const split = serverGroupName.split('-'),
      isVersioned = NamingService.VERSION_PATTERN.test(split[split.length - 1]);

    if (isVersioned) {
      split.pop();
    }
    return split.join('-');
  }

  public getSequence(serverGroupName: string): string {
    const split = serverGroupName.split('-'),
      isVersioned = NamingService.VERSION_PATTERN.test(split[split.length - 1]);

    if (isVersioned) {
      return split.pop();
    }
    return null;
  }

  public parseLoadBalancerName(loadBalancerName: string): IComponentName {
    const split = loadBalancerName.split('-'),
      result: IComponentName = {
        application: split[0],
        stack: '',
        freeFormDetails: '',
        cluster: '',
      };

    if (split.length > 1) {
      result.stack = split[1];
    }
    if (split.length > 2) {
      result.freeFormDetails = split.slice(2, split.length).join('-');
    }
    result.cluster = this.getClusterName(result.application, result.stack, result.freeFormDetails);
    return result;
  }

  public parseSecurityGroupName(securityGroupName: string): IComponentName {
    return this.parseLoadBalancerName(securityGroupName);
  }
}

export const NAMING_SERVICE = 'spinnaker.core.naming.service';

module(NAMING_SERVICE, [])
  .service('namingService', NamingService);
