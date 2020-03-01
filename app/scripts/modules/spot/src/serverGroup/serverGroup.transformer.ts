import { IPromise } from 'angular';

import { defaults } from 'lodash';

import { ISpotServerGroup, ISpotServerGroupView } from 'spot/src/domain';

export class SpotServerGroupTransformer {
  public static $inject = ['$q'];
  public constructor(private $q: ng.IQService) {}

  public normalizeServerGroupDetails(serverGroup: ISpotServerGroup): ISpotServerGroupView {
    return serverGroup;
  }

  public normalizeServerGroup(serverGroup: ISpotServerGroup): IPromise<ISpotServerGroup> {
    return this.$q.resolve(serverGroup);
  }

  public convertServerGroupCommandToDeployConfiguration(base: any): any {
    const command = defaults({ viewState: [] }, base);
    command.cloudProvider = 'spot';
    command.provider = 'spot';
    command.account = command.credentials;
    return command;
  }
}
