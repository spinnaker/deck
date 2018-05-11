import { module } from 'angular';
import { get, has } from 'lodash';

import { IPipeline, IStage, IStageOrTriggerTypeConfig, ITrigger } from 'core/domain';
import {
  IStageOrTriggerValidator,
  IValidatorConfig,
  PIPELINE_CONFIG_VALIDATOR,
  PipelineConfigValidator,
} from './pipelineConfig.validator';

export interface IRequiredField {
  fieldName: string;
  fieldLabel?: string;
}

export interface IBaseRequiredFieldValidationConfig extends IValidatorConfig {
  message?: string;
}

export type IRequiredFieldValidationConfig = IRequiredField & IBaseRequiredFieldValidationConfig;

export class RequiredFieldValidator implements IStageOrTriggerValidator {
  public validate(
    pipeline: IPipeline,
    stage: IStage | ITrigger,
    validationConfig: IRequiredFieldValidationConfig,
    config: IStageOrTriggerTypeConfig,
  ): string {
    if (!this.passesValidation(pipeline, stage, validationConfig)) {
      return this.validationMessage(validationConfig, config);
    }
    return null;
  }

  protected passesValidation(
    pipeline: IPipeline,
    stage: IStage | ITrigger,
    validationConfig: IRequiredFieldValidationConfig,
  ): boolean {
    return this.fieldIsValid(pipeline, stage, validationConfig.fieldName);
  }

  protected validationMessage(
    validationConfig: IRequiredFieldValidationConfig,
    config: IStageOrTriggerTypeConfig,
  ): string {
    let fieldLabel: string = this.printableFieldLabel(validationConfig);
    return validationConfig.message || `<strong>${fieldLabel}</strong> is a required field for ${config.label} stages.`;
  }

  protected printableFieldLabel(field: IRequiredField): string {
    let fieldLabel: string = field.fieldLabel || field.fieldName;
    return fieldLabel.charAt(0).toUpperCase() + fieldLabel.substr(1);
  }

  protected fieldIsValid(pipeline: IPipeline, stage: IStage | ITrigger, fieldName: string): boolean {
    if (pipeline.strategy === true && ['cluster', 'regions', 'zones', 'credentials'].includes(fieldName)) {
      return true;
    }

    const fieldExists = has(stage, fieldName);
    const field: any = get(stage, fieldName);

    return fieldExists && (field || field === 0) && !(field instanceof Array && field.length === 0);
  }
}

export const REQUIRED_FIELD_VALIDATOR = 'spinnaker.core.pipeline.config.validation.requiredField';
module(REQUIRED_FIELD_VALIDATOR, [PIPELINE_CONFIG_VALIDATOR])
  .service('requiredFieldValidator', RequiredFieldValidator)
  .run((pipelineConfigValidator: PipelineConfigValidator, requiredFieldValidator: RequiredFieldValidator) => {
    pipelineConfigValidator.registerValidator('requiredField', requiredFieldValidator);
  });
