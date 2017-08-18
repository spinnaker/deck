import { IComponentController } from 'angular';

import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { IModalServiceInstance } from 'angular-ui-bootstrap';

import { Application, IServerGroup, TaskMonitorBuilder, TaskMonitor } from '@spinnaker/core';

import { ITargetTrackingConfiguration, ITargetTrackingPolicy } from 'amazon/domain';
import { IUpsertScalingPolicyCommand, ScalingPolicyWriter } from 'amazon/serverGroup';

export type MetricType = 'custom' | 'predefined';

export interface ITargetTrackingState {
  metricType: MetricType;
  unit: string;
  scaleInChanged: boolean;
}

export interface ITargetTrackingPolicyCommand extends IUpsertScalingPolicyCommand {
  estimatedInstanceWarmup: number;
  targetTrackingConfiguration: ITargetTrackingConfiguration;
}

export class UpsertTargetTrackingController implements IComponentController {

  public predefinedMetrics = ['ASGAverageCPUUtilization', 'ASGAverageNetworkOut', 'ASGAverageNetworkIn'];
  public statistics = ['Average', 'Maximum', 'Minimum', 'SampleCount', 'Sum'];
  public alarmUpdated = new Subject();

  public taskMonitor: TaskMonitor;
  public state: ITargetTrackingState;
  public command: ITargetTrackingPolicyCommand;

  constructor(private $uibModalInstance: IModalServiceInstance,
              private scalingPolicyWriter: ScalingPolicyWriter,
              private taskMonitorBuilder: TaskMonitorBuilder,
              public policy: ITargetTrackingPolicy,
              public serverGroup: IServerGroup,
              public application: Application) {
    'ngInject';
  }

  public $onInit() {
    const metricType = this.policy.targetTrackingConfiguration.customizedMetricSpecification ?
      'custom' :
      'predefined';
    this.command = this.buildCommand();
    this.state = {
      metricType,
      unit: null,
      scaleInChanged: false,
    };
  }

  public toggleMetricType(): void {
    const config = this.command.targetTrackingConfiguration;
    if (this.state.metricType === 'predefined') {
      config.predefinedMetricSpecification = null;
      config.customizedMetricSpecification = {
        metricName: 'CPUUtilization',
        namespace: 'AWS/EC2',
        dimensions: [{ name: 'AutoScalingGroupName', value: this.serverGroup.name}],
        statistic: 'Average',
      };
      this.state.metricType = 'custom';
    } else {
      config.customizedMetricSpecification = null;
      config.predefinedMetricSpecification = {
        predefinedMetricType: 'ASGAverageCPUUtilization',
      };
      this.state.metricType = 'predefined';
    }
  }

  public scaleInChanged(): void {
    this.state.scaleInChanged = true;
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }

  public save(): void {
    const action = this.policy.policyName ? 'Update' : 'Create';
    const command = cloneDeep(this.command);
    this.taskMonitor = this.taskMonitorBuilder.buildTaskMonitor({
      application: this.application,
      title: `${action} scaling policy for ${this.serverGroup.name}`,
      modalInstance: this.$uibModalInstance,
      submitMethod: () => this.scalingPolicyWriter.upsertScalingPolicy(this.application, command)
    });

    this.taskMonitor.submit();
  }

  private buildCommand(): ITargetTrackingPolicyCommand {
    return {
      type: 'upsertScalingPolicy',
      cloudProvider: 'aws',
      credentials: this.serverGroup.account,
      region: this.serverGroup.region,
      serverGroupName: this.serverGroup.name,
      adjustmentType: null,
      name: this.policy.policyName,
      estimatedInstanceWarmup: this.policy.estimatedInstanceWarmup || 600,
      targetTrackingConfiguration: Object.assign({}, this.policy.targetTrackingConfiguration),
    };
  }

}
