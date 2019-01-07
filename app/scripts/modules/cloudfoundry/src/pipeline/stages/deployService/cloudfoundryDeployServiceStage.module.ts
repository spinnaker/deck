import { IController, IScope, module } from 'angular';
import { react2angular } from 'react2angular';

import { CloudfoundryDeployServiceStageConfig } from './CloudfoundryDeployServiceStageConfig';
import { ExecutionDetailsTasks, IStage, Registry } from '@spinnaker/core';
import { CloudfoundryDeployServiceExecutionDetails } from 'cloudfoundry/pipeline/stages/deployService/CloudfoundryDeployServiceExecutionDetails';
import { IServiceFieldValidatorConfig } from 'cloudfoundry/pipeline/config/validation/ServiceFieldValidatorConfig';

class CloudFoundryDeployServiceStageCtrl implements IController {
  constructor(public $scope: IScope) {
    'ngInject';
  }
}

const serviceNameValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'requiredServiceField',
  serviceInputType: 'direct',
  fieldName: 'serviceName',
  preventSave: true,
};

const serviceValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'requiredServiceField',
  serviceInputType: 'direct',
  fieldName: 'service',
  preventSave: true,
};

const servicePlanValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'requiredServiceField',
  serviceInputType: 'direct',
  fieldName: 'servicePlan',
  preventSave: true,
};

const jsonValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'validServiceParameterJson',
  serviceInputType: 'direct',
  fieldName: 'parameters',
  preventSave: true,
};

const accountValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'requiredServiceField',
  serviceInputType: 'artifact',
  fieldName: 'account',
  preventSave: true,
};

const referenceValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'requiredServiceField',
  serviceInputType: 'artifact',
  fieldName: 'reference',
  preventSave: true,
};

const userProvidedServiceNameValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'requiredServiceField',
  serviceInputType: 'userProvided',
  fieldName: 'serviceName',
  preventSave: true,
};

const credentialsJsonValidatorConfig: IServiceFieldValidatorConfig = {
  type: 'validServiceParameterJson',
  serviceInputType: 'userProvided',
  fieldName: 'credentials',
  preventSave: true,
};

export const CLOUD_FOUNDRY_DEPLOY_SERVICE_STAGE = 'spinnaker.cloudfoundry.pipeline.stage.deployServiceStage';
module(CLOUD_FOUNDRY_DEPLOY_SERVICE_STAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      accountExtractor: (stage: IStage) => stage.context.credentials,
      configAccountExtractor: (stage: IStage) => [stage.credentials],
      provides: 'deployService',
      key: 'deployService',
      cloudProvider: 'cloudfoundry',
      templateUrl: require('./cloudfoundryDeployServiceStage.html'),
      controller: 'cfDeployServiceStageCtrl',
      executionDetailsSections: [CloudfoundryDeployServiceExecutionDetails, ExecutionDetailsTasks],
      validators: [
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
        { type: 'requiredField', fieldName: 'region' },
        serviceNameValidatorConfig,
        serviceValidatorConfig,
        servicePlanValidatorConfig,
        jsonValidatorConfig,
        accountValidatorConfig,
        referenceValidatorConfig,
        userProvidedServiceNameValidatorConfig,
        credentialsJsonValidatorConfig,
      ],
    });
  })
  .component(
    'cfDeployServiceStage',
    react2angular(CloudfoundryDeployServiceStageConfig, ['stage', 'stageFieldUpdated']),
  )
  .controller('cfDeployServiceStageCtrl', CloudFoundryDeployServiceStageCtrl);
