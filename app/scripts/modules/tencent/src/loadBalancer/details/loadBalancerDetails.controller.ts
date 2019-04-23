import { IController, IPromise, IQService, IScope, module } from 'angular';
import { StateService } from '@uirouter/angularjs';

import {
  Application,
  ConfirmationModalService,
  IApplicationSecurityGroup,
  ILoadBalancer,
  ISecurityGroup,
  ISubnet,
  LOAD_BALANCER_READ_SERVICE,
  LoadBalancerReader,
  SETTINGS,
  SECURITY_GROUP_READER,
  SecurityGroupReader,
  SubnetReader,
  FirewallLabels,
} from '@spinnaker/core';

import { ITencentLoadBalancer, ITencentLoadBalancerSourceData, IListenerAction, ITargetGroup } from 'tencent/domain';

import { LOAD_BALANCER_ACTIONS } from './loadBalancerActions.component';

export interface ILoadBalancerFromStateParams {
  accountId: string;
  region: string;
  name: string;
}

export interface IActionDetails extends IListenerAction {
  targetGroup: ITargetGroup;
}

export class TencentLoadBalancerDetailsController implements IController {
  public application: Application;
  public elbProtocol: string;
  public listeners: Array<{ in: string; actions: IActionDetails[] }>;
  public loadBalancerFromParams: ILoadBalancerFromStateParams;
  public loadBalancer: ITencentLoadBalancer;
  public securityGroups: ISecurityGroup[];
  public ipAddressTypeDescription: string;
  public state = { loading: true };
  public firewallsLabel = FirewallLabels.get('Firewalls');
  public oidcConfigPath = SETTINGS.oidcConfigPath;

  public static $inject = [
    '$scope',
    '$state',
    '$q',
    'loadBalancer',
    'app',
    'securityGroupReader',
    'loadBalancerReader',
  ];
  constructor(
    private $scope: IScope,
    private $state: StateService,
    private $q: IQService,
    loadBalancer: ILoadBalancerFromStateParams,
    private app: Application,
    private securityGroupReader: SecurityGroupReader,
    private loadBalancerReader: LoadBalancerReader,
  ) {
    this.application = app;
    this.loadBalancerFromParams = loadBalancer;

    this.app
      .ready()
      .then(() => this.extractLoadBalancer())
      .then(() => {
        // If the user navigates away from the view before the initial extractLoadBalancer call completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed) {
          app.getDataSource('loadBalancers').onRefresh($scope, () => this.extractLoadBalancer());
        }
      });
  }

  public autoClose(): void {
    if (this.$scope.$$destroyed) {
      return;
    }
    this.$state.params.allowModalToStayOpen = true;
    this.$state.go('^', null, { location: 'replace' });
  }

  public extractLoadBalancer(): IPromise<void> {
    const appLoadBalancer = this.app.loadBalancers.data.find((test: ILoadBalancer) => {
      return (
        test.name === this.loadBalancerFromParams.name &&
        test.region === this.loadBalancerFromParams.region &&
        test.account === this.loadBalancerFromParams.accountId
      );
    });

    if (appLoadBalancer) {
      const detailsLoader = this.loadBalancerReader.getLoadBalancerDetails(
        'tencent',
        this.loadBalancerFromParams.accountId,
        this.loadBalancerFromParams.region,
        appLoadBalancer.id,
      );
      return detailsLoader.then(
        (details: ITencentLoadBalancerSourceData[]) => {
          this.loadBalancer = appLoadBalancer;
          this.state.loading = false;
          const securityGroups: IApplicationSecurityGroup[] = [];
          if (details.length) {
            this.loadBalancer.elb = details[0];
            this.ipAddressTypeDescription = 'IPv4';
            (this.loadBalancer.elb.securityGroups || []).forEach((securityGroupId: string) => {
              const match = this.securityGroupReader.getApplicationSecurityGroup(
                this.app,
                this.loadBalancerFromParams.accountId,
                this.loadBalancerFromParams.region,
                securityGroupId,
              );
              if (match) {
                securityGroups.push(match);
              }
            });
            this.securityGroups = securityGroups;

            if (this.loadBalancer.subnetId) {
              this.loadBalancer.subnetDetails = [this.loadBalancer.subnetId].reduce(
                (subnetDetails: ISubnet[], subnetId: string) => {
                  SubnetReader.getSubnetByIdAndProvider(subnetId, this.loadBalancer.provider).then(
                    (subnetDetail: ISubnet) => {
                      subnetDetails.push(subnetDetail);
                    },
                  );

                  return subnetDetails;
                },
                [],
              );
            }
          }
        },
        () => this.autoClose(),
      );
    } else {
      this.autoClose();
    }
    if (!this.loadBalancer) {
      this.autoClose();
    }

    return this.$q.when(null);
  }
}

export const TENCENT_LOAD_BALANCER_DETAILS_CTRL = 'spinnaker.tencent.loadBalancer.details.controller';
module(TENCENT_LOAD_BALANCER_DETAILS_CTRL, [
  require('@uirouter/angularjs').default,
  SECURITY_GROUP_READER,
  LOAD_BALANCER_ACTIONS,
  LOAD_BALANCER_READ_SERVICE,
  ConfirmationModalService,
]).controller('tencentLoadBalancerDetailsCtrl', TencentLoadBalancerDetailsController);
