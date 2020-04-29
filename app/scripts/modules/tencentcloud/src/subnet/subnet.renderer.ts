import { module } from 'angular';

import { IServerGroup } from '@spinnaker/core';

export class TencentCloudSubnetRenderer {
  public render(serverGroup: IServerGroup): string {
    return serverGroup.subnetType;
  }
}

export const SUBNET_RENDERER = 'spinnaker.tencentcloud.subnet.renderer';
module(SUBNET_RENDERER, []).service('tencentSubnetRenderer', TencentCloudSubnetRenderer);
