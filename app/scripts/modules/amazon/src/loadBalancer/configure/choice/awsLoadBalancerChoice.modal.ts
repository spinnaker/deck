import { IController, module } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';

import { Application } from '@spinnaker/core';

import { IAwsLoadBalancerConfig, LoadBalancerTypes } from './LoadBalancerTypes';

class AwsLoadBalancerChoiceCtrl implements IController {
  public choices: IAwsLoadBalancerConfig[];
  public choice: IAwsLoadBalancerConfig;

  constructor(private $uibModal: any,
              private $uibModalInstance: IModalInstanceService,
              private application: Application,
              private loadBalancer: any,
              private isNew: boolean,
              private forPipelineConfig: boolean) {
    'ngInject';
  }

  public $onInit(): void {
    this.choices = LoadBalancerTypes;
    this.choice = this.choices[0];
    if (this.loadBalancer) {
      // If we're editing an existing LB, preset the choice based on config,
      const needed_type = this.loadBalancer.loadBalancerType;
      this.choice = LoadBalancerTypes.filter(function(el) {
        return el.type === needed_type;
      })[0];
    }
  }

  public onChoiceSelection(choice: IAwsLoadBalancerConfig): void {
    this.choice = choice;
  }

  public choose(): void {
    // NOTE:  Can't just dismiss here, pipelineconfig is expecting the
    //        result of the config to be passed back as a promise from
    //        the initial modal, which we're closing here...
    this.$uibModalInstance.close(
      this.$uibModal.open({
        templateUrl: this.choice.createTemplateUrl,
        controller: `${this.choice.controller} as ctrl`,
        size: 'lg',
        resolve: {
          application: () => this.application,
          loadBalancer: () => this.loadBalancer,
          isNew: () => this.isNew || (this.loadBalancer == null),
          forPipelineConfig: () => this.forPipelineConfig,
        }
      }).result.then(function(newLoadBalancer: any) {
         return newLoadBalancer;
      })
    );
  }
}

export const AWS_LOAD_BALANCER_CHOICE_MODAL = 'spinnaker.amazon.loadBalancerChoice.modal.controller';

module(AWS_LOAD_BALANCER_CHOICE_MODAL, [])
  .controller('awsLoadBalancerChoiceCtrl', AwsLoadBalancerChoiceCtrl);
