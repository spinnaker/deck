import { copy, equals, IController, module } from 'angular'
import { IModalServiceInstance } from 'angular-ui-bootstrap';

import {
  Application,
  ICapacity,
  SERVER_GROUP_WRITER,
  ServerGroupWriter,
  TASK_MONITOR_BUILDER,
  TaskMonitor,
  TaskMonitorBuilder
} from '@spinnaker/core';
import { IKubernetesServerGroup } from '../IKubernetesServerGroup';

interface IResizeCommand {
  capacity: ICapacity;
  reason: string;
}

class KubernetesServerGroupResizeController implements IController {
  public taskMonitor: TaskMonitor;
  public command: IResizeCommand;
  public current: ICapacity;
  public verification = {
    verified: false
  };

  constructor(public serverGroup: IKubernetesServerGroup,
              taskMonitorBuilder: TaskMonitorBuilder,
              private $uibModalInstance: IModalServiceInstance,
              private serverGroupWriter: ServerGroupWriter,
              private application: Application) {
    'ngInject';
    this.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      title: `Resizing ${this.serverGroup.name}`,
      application: application,
      modalInstance: $uibModalInstance,
    });

    this.current = this.serverGroup.capacity;
    this.command = {
      capacity: copy(this.current),
      reason: null,
    };
  }

  public isValid(): boolean {
    return this.verification.verified && this.command.capacity.desired >= 0 && !equals(this.command.capacity, this.current);
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  };

  public resize(): void {
    this.taskMonitor.submit(() => {
      const payload = {
        capacity: this.command.capacity,
        serverGroupName: this.serverGroup.name,
        account: this.serverGroup.account,
        region: this.serverGroup.region,
        interestingHealthProviderNames: ['KubernetesPod'],
        reason: this.command.reason,
      };

      return this.serverGroupWriter.resizeServerGroup(this.serverGroup, this.application, payload);
    });
  }
}

export const KUBERNETES_V2_SERVER_GROUP_RESIZE_CTRL = 'spinnaker.kubernetes.v2.serverGroup.details.resize.controller';

module(KUBERNETES_V2_SERVER_GROUP_RESIZE_CTRL, [
  SERVER_GROUP_WRITER,
  TASK_MONITOR_BUILDER,
])
  .controller('kubernetesV2ServerGroupResizeCtrl', KubernetesServerGroupResizeController);
