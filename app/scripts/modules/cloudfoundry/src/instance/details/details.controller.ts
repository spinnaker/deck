import { IController, IPromise, IQService, module } from 'angular';
import { StateService } from '@uirouter/angularjs';
import { cloneDeep, flattenDeep } from 'lodash';

import {
  Application,
  CONFIRMATION_MODAL_SERVICE,
  ConfirmationModalService,
  INSTANCE_WRITE_SERVICE,
  InstanceReader,
  InstanceWriter,
  RecentHistoryService,
} from '@spinnaker/core';

import { ICloudFoundryInstance } from 'cloudfoundry/domain';

interface InstanceFromStateParams {
  instanceId: string;
}

interface InstanceManager {
  account: string;
  region: string;
  category: string; // e.g., serverGroup, loadBalancer.
  name: string; // Parent resource name, not instance name.
  instances: ICloudFoundryInstance[];
}

class CloudFoundryInstanceDetailsController implements IController {
  public state = { loading: true };
  public instance: ICloudFoundryInstance;
  public instanceIdNotFound: string;
  public upToolTip = `A CloudFoundry instance is 'Up' if a load balancer is directing traffic to its server group.`;
  public outOfServiceToolTip = `
    A CloudFoundry instance is 'Out Of Service' if no load balancers are directing traffic to its server group.`;

  constructor(
    private $state: StateService,
    private $q: IQService,
    private app: Application,
    private instanceWriter: InstanceWriter,
    private confirmationModalService: ConfirmationModalService,
    instance: InstanceFromStateParams,
  ) {
    'ngInject';

    this.app
      .ready()
      .then(() => this.retrieveInstance(instance))
      .then(instanceDetails => {
        this.instance = instanceDetails;
        this.state.loading = false;
      })
      .catch(() => {
        this.instanceIdNotFound = instance.instanceId;
        this.state.loading = false;
      });
  }

  public terminateInstance(): void {
    const instance = cloneDeep(this.instance) as any;
    instance.placement = {};
    instance.id = instance.name;
    const $state = this.$state;
    const taskMonitor = {
      application: this.app,
      title: 'Terminating ' + instance.name,
      onTaskComplete() {
        if ($state.includes('**.instanceDetails', { instanceId: instance.name })) {
          $state.go('^');
        }
      },
    };

    const submitMethod = () => {
      return this.instanceWriter.terminateInstance(instance, this.app, { cloudProvider: 'cloudfoundry' });
    };

    this.confirmationModalService.confirm({
      header: 'Really terminate ' + instance.name + '?',
      buttonText: 'Terminate',
      account: instance.account,
      taskMonitorConfig: taskMonitor,
      submitMethod,
    });
  }

  private retrieveInstance(instance: InstanceFromStateParams): IPromise<ICloudFoundryInstance> {
    const instanceLocatorPredicate = (dataSource: InstanceManager) => {
      return dataSource.instances.some(possibleMatch => possibleMatch.id === instance.instanceId);
    };

    const dataSources: InstanceManager[] = flattenDeep([
      this.app.getDataSource('serverGroups').data,
      this.app.getDataSource('loadBalancers').data,
      this.app.getDataSource('loadBalancers').data.map(loadBalancer => loadBalancer.serverGroups),
    ]);

    const instanceManager = dataSources.find(instanceLocatorPredicate);

    if (instanceManager) {
      const recentHistoryExtraData: { [key: string]: string } = {
        region: instanceManager.region,
        account: instanceManager.account,
      };
      if (instanceManager.category === 'serverGroup') {
        recentHistoryExtraData.serverGroup = instanceManager.name;
      }
      RecentHistoryService.addExtraDataToLatest('instances', recentHistoryExtraData);

      return InstanceReader.getInstanceDetails(
        instanceManager.account,
        instanceManager.region,
        instance.instanceId,
      ).then((instanceDetails: ICloudFoundryInstance) => {
        instanceDetails.account = instanceManager.account;
        instanceDetails.region = instanceManager.region;
        return instanceDetails;
      });
    } else {
      return this.$q.reject();
    }
  }
}

export const CLOUD_FOUNDRY_INSTANCE_DETAILS_CTRL = 'spinnaker.cloudfoundry.instanceDetails.controller';

module(CLOUD_FOUNDRY_INSTANCE_DETAILS_CTRL, [INSTANCE_WRITE_SERVICE, CONFIRMATION_MODAL_SERVICE]).controller(
  'cloudfoundryInstanceDetailsCtrl',
  CloudFoundryInstanceDetailsController,
);
