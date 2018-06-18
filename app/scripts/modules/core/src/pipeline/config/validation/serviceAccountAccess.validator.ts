import { SETTINGS } from 'core/config/settings';
import { IPipeline, IStage, IStageOrTriggerTypeConfig } from 'core/domain';
import { ServiceAccountReader } from 'core/serviceAccount/ServiceAccountReader';

import { IStageOrTriggerValidator, IValidatorConfig, PipelineConfigValidator } from './PipelineConfigValidator';
import { IServiceAccount } from 'core';

export interface ITriggerWithServiceAccount extends IStage {
  runAsUser: string;
}

export interface IServiceAccountAccessValidationConfig extends IValidatorConfig {
  message: string;
}

export class ServiceAccountAccessValidator implements IStageOrTriggerValidator {
  public validate(
    _pipeline: IPipeline,
    stage: ITriggerWithServiceAccount,
    validator: IServiceAccountAccessValidationConfig,
    _config: IStageOrTriggerTypeConfig,
  ): ng.IPromise<string> {
    if (SETTINGS.feature.fiatEnabled) {
      return ServiceAccountReader.getServiceAccounts().then((serviceAccounts: IServiceAccount[]) => {
        if (stage.runAsUser && !serviceAccounts.map(s => s.name).includes(stage.runAsUser)) {
          return validator.message;
        } else {
          return null;
        }
      });
    } else {
      return null;
    }
  }
}

PipelineConfigValidator.registerValidator('serviceAccountAccess', new ServiceAccountAccessValidator());
