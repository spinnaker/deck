import { IController, IScope, module } from 'angular';
import { StateParams } from '@uirouter/angularjs';
import { get } from 'lodash';

import {
  EXECUTION_DETAILS_SECTION_SERVICE,
  ExecutionDetailsSectionService,
} from 'core/pipeline/details/executionDetailsSection.service';

import { EXECUTION_ARTIFACT_TAB } from 'core/artifact/artifactTab';

export class WebhookExecutionDetailsCtrl implements IController {
  public configSections = ['webhookConfig', 'taskStatus', 'artifactStatus'];
  public detailsSection: string;
  public failureMessage: string;
  public progressMessage: string;
  public stage: any;

  constructor(
    private $stateParams: StateParams,
    private executionDetailsSectionService: ExecutionDetailsSectionService,
    private $scope: IScope,
  ) {
    'ngInject';
    this.initialize();
    this.$scope.$on('$stateChangeSuccess', () => this.initialize());
  }

  public initialized(): void {
    this.stage = this.$scope.stage;
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
      webhook = context.webhook || {},
      monitor = webhook.monitor || {},
      error = monitor.error || null;

    if (this.stage.originalStatus === 'TERMINAL') {
      if (error) {
        failureMessage = `Webhook failed: ${error}`;
      } else if (monitor.progressMessage) {
        failureMessage = `Webhook failed. Last known progress message: ${monitor.progressMessage}`;
      }
    }
    return failureMessage;
  }

  private initialize(): void {
    this.executionDetailsSectionService.synchronizeSection(this.configSections, () => this.initialized());
  }
}

export const WEBHOOK_EXECUTION_DETAILS_CONTROLLER = 'spinnaker.core.pipeline.stage.webhook.executionDetails.controller';
module(WEBHOOK_EXECUTION_DETAILS_CONTROLLER, [EXECUTION_DETAILS_SECTION_SERVICE, EXECUTION_ARTIFACT_TAB]).controller(
  'WebhookExecutionDetailsCtrl',
  WebhookExecutionDetailsCtrl,
);
