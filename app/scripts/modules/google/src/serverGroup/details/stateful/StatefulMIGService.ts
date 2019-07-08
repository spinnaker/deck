import { has } from 'lodash';

import { SETTINGS, TaskExecutor } from '@spinnaker/core';

import { IGceServerGroup } from 'google/domain';

export class StatefulMIGService {
  public static markDiskStateful(applicationName: string, deviceName: string, serverGroup: IGceServerGroup) {
    return TaskExecutor.executeTask({
      application: applicationName,
      description: 'Mark disk as stateful',
      job: [
        {
          cloudProvider: 'gce',
          credentials: serverGroup.account,
          deviceName,
          region: serverGroup.region,
          serverGroupName: serverGroup.name,
          type: 'setStatefulDisk',
        },
      ],
    });
  }

  public static statefullyUpdateBootDisk(applicationName: string, bootImage: string, serverGroup: IGceServerGroup) {
    return TaskExecutor.executeTask({
      application: applicationName,
      description: 'Statefully update boot disk image',
      job: [
        {
          bootImage,
          cloudProvider: 'gce',
          credentials: serverGroup.account,
          region: serverGroup.region,
          serverGroupName: serverGroup.name,
          type: 'statefullyUpdateBootDisk',
        },
      ],
    });
  }

  public static isDiskStateful(deviceName: string, serverGroup: IGceServerGroup): boolean {
    return has(serverGroup, ['statefulPolicy', 'preservedState', 'disks', deviceName]);
  }

  public static statefulMigsEnabled(): boolean {
    return SETTINGS.feature.gceStatefulMigsEnabled;
  }
}
