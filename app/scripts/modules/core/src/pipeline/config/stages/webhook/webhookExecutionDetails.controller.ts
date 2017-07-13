import { IComponentController, IScope, module } from 'angular';
import { StateParams } from '@uirouter/angularjs';
import { get } from 'lodash';

import {
  EXECUTION_DETAILS_SECTION_SERVICE,
  ExecutionDetailsSectionService
} from 'core/delivery/details/executionDetailsSection.service';

export class WebhookExecutionDetailsCtrl implements IComponentController {
  public configSections = ['webhookConfig', 'taskStatus'];
  public detailsSection: string;
  public failureMessage: string;
  public progressMessage: string;
  public stage: any;

  constructor(private $stateParams: StateParams,
              private executionDetailsSectionService: ExecutionDetailsSectionService,
              private $scope: IScope) {
    'ngInject';
    this.stage = this.$scope.stage;
    this.initialize();
    this.$scope.$on('$stateChangeSuccess', () => this.initialize());
  }

  public initialized(): void {
    this.detailsSection = get<string>(this.$stateParams, 'details', '');
    this.failureMessage = this.getFailureMessage();
    this.progressMessage = this.getProgressMessage();
  }

  private getProgressMessage(): string {
    const context = this.stage.context || {},
      buildInfo = context.buildInfo || {};
    return buildInfo.progressMessage;
  }

  private getFailureMessage(): string {
    let failureMessage = this.stage.failureMessage;
    const context = this.stage.context || {},
      buildInfo = context.buildInfo || {};
    if (buildInfo.status === 'TERMINAL') {
        failureMessage = `Webhook failed: ${buildInfo.reason}`;
    }
    return failureMessage;
  }

  private initialize(): void {
    this.executionDetailsSectionService.synchronizeSection(this.configSections, () => this.initialized());
  }

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

export const WEBHOOK_EXECUTION_DETAILS_CONTROLLER = 'spinnaker.core.pipeline.stage.webhook.executionDetails.controller';
module(WEBHOOK_EXECUTION_DETAILS_CONTROLLER, [
  EXECUTION_DETAILS_SECTION_SERVICE,
]).controller('WebhookExecutionDetailsCtrl', WebhookExecutionDetailsCtrl);
