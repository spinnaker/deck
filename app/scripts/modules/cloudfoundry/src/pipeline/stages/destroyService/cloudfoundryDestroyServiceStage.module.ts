import { CloudfoundryDestroyServiceStageConfig } from './CloudfoundryDestroyServiceStageConfig';
import { ExecutionDetailsTasks, IStage, Registry } from '@spinnaker/core';
import { CloudfoundryServiceExecutionDetails } from 'cloudfoundry/presentation';

Registry.pipeline.registerStage({
  accountExtractor: (stage: IStage) => stage.context.credentials,
  configAccountExtractor: (stage: IStage) => [stage.credentials],
  provides: 'destroyService',
  key: 'destroyService',
  cloudProvider: 'cloudfoundry',
  component: CloudfoundryDestroyServiceStageConfig,
  templateUrl: require('./cloudfoundryDestroyServiceStage.html'),
  controller: 'cfDestroyServiceStageCtrl',
  executionDetailsSections: [CloudfoundryServiceExecutionDetails, ExecutionDetailsTasks],
  defaultTimeoutMs: 30 * 60 * 1000,
  validators: [
    { type: 'requiredField', fieldName: 'region' },
    { type: 'requiredField', fieldName: 'serviceInstanceName', preventSave: true },
    { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
  ],
});
