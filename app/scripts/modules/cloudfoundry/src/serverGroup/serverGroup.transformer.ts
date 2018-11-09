import { module, IPromise } from 'angular';

import { defaults } from 'lodash';

import { ICloudFoundryServerGroup, ICloudFoundryEnvVar } from 'cloudfoundry/domain';

export class CloudFoundryServerGroupTransformer {
  public constructor(private $q: ng.IQService) {
    'ngInject';
  }

  public normalizeServerGroupDetails(serverGroup: ICloudFoundryServerGroup): ICloudFoundryServerGroup {
    return serverGroup;
  }

  public normalizeServerGroup(serverGroup: ICloudFoundryServerGroup): IPromise<ICloudFoundryServerGroup> {
    return this.$q.resolve(serverGroup);
  }

  public convertServerGroupCommandToDeployConfiguration(base: any): any {
    const command = defaults({ viewState: [] }, base);
    command.cloudProvider = 'cloudfoundry';
    command.provider = 'cloudfoundry';
    command.account = command.credentials;

    delete command.viewState;
    delete command.selectedProvider;

    if (command.manifest.type === 'direct') {
      command.manifest.env = this.convertManifestEnv(command.manifest.environment);
    } else {
      command.manifest.env = command.manifest.environment;
    }

    return command;
  }

  private convertManifestEnv(envVars: ICloudFoundryEnvVar[]): {} {
    const newEnv = Object.create(null);
    for (const envVar of envVars) {
      newEnv[envVar.key] = envVar.value;
    }
    return newEnv;
  }
}

export const CLOUD_FOUNDRY_SERVER_GROUP_TRANSFORMER = 'spinnaker.cloudfoundry.serverGroup.transformer';
module(CLOUD_FOUNDRY_SERVER_GROUP_TRANSFORMER, []).service(
  'cfServerGroupTransformer',
  CloudFoundryServerGroupTransformer,
);
