import { IController, IPromise, module } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';

import {
  Application,
  ILoadBalancerDeleteCommand,
  LOAD_BALANCER_WRITE_SERVICE,
  LoadBalancerWriter,
  TASK_MONITOR_BUILDER,
  TaskMonitorBuilder
} from '@spinnaker/core';

import {
  GCE_HTTP_LOAD_BALANCER_UTILS,
  GceHttpLoadBalancerUtils
} from 'google/loadBalancer/httpLoadBalancerUtils.service';

class Verification {
  public verified = false;
}

class Params {
  public deleteHealthChecks = false;
}

interface IGoogleLoadBalancerDeleteOperation extends ILoadBalancerDeleteCommand {
  region: string;
  accountName: string;
  deleteHealthChecks: boolean;
  loadBalancerType: string;
}

class DeleteLoadBalancerModalController implements IController {
  public verification: Verification = new Verification();
  public params: Params = new Params();
  public taskMonitor: any;

  constructor (private application: Application,
               private gceHttpLoadBalancerUtils: GceHttpLoadBalancerUtils,
               private gceHttpLoadBalancerWriter: any,
               private loadBalancer: any,
               private loadBalancerWriter: LoadBalancerWriter,
               private taskMonitorBuilder: TaskMonitorBuilder,
               private $uibModalInstance: IModalInstanceService) {
    'ngInject';
  }

  public $onInit (): void {

    const taskMonitorConfig = {
      application: this.application,
      title: 'Deleting ' + this.loadBalancer.name,
      modalInstance: this.$uibModalInstance,
    };

    this.taskMonitor = this.taskMonitorBuilder.buildTaskMonitor(taskMonitorConfig);
  }

  public isValid (): boolean {
    return this.verification.verified;
  }

  public submit (): void {
    this.taskMonitor.submit(this.getSubmitMethod());
  }

  public cancel (): void {
    this.$uibModalInstance.dismiss();
  }

  public hasHealthChecks (): boolean {
    if (this.gceHttpLoadBalancerUtils.isHttpLoadBalancer(this.loadBalancer)) {
      return true;
    } else {
      return !!this.loadBalancer.healthCheck;
    }
  }

  private getSubmitMethod (): {(): IPromise<any>} {
    if (this.gceHttpLoadBalancerUtils.isHttpLoadBalancer(this.loadBalancer)) {
      return () => {
        return this.gceHttpLoadBalancerWriter.deleteLoadBalancers(this.loadBalancer, this.application, this.params);
      };
    } else {
      return () => {
        const command: IGoogleLoadBalancerDeleteOperation = {
          cloudProvider: 'gce',
          loadBalancerName: this.loadBalancer.name,
          accountName: this.loadBalancer.account,
          credentials: this.loadBalancer.account,
          region: this.loadBalancer.region,
          loadBalancerType: this.loadBalancer.loadBalancerType || 'NETWORK',
          deleteHealthChecks: this.params.deleteHealthChecks,
        };
        return this.loadBalancerWriter.deleteLoadBalancer(command, this.application);
      };
    }
  }
}

export const DELETE_MODAL_CONTROLLER = 'spinnaker.gce.loadBalancer.deleteModal.controller';
module(DELETE_MODAL_CONTROLLER, [
    require('angular-ui-bootstrap'),
    TASK_MONITOR_BUILDER,
    LOAD_BALANCER_WRITE_SERVICE,
    require('../../configure/http/httpLoadBalancer.write.service.js'),
    GCE_HTTP_LOAD_BALANCER_UTILS,
  ])
  .controller('gceLoadBalancerDeleteModalCtrl', DeleteLoadBalancerModalController);
