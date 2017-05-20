import { module } from 'angular';
import { Subject, Subscription } from 'rxjs';

import {
  IPipeline,
  IStage,
  IStageOrTriggerTypeConfig,
  IStageTypeConfig,
  ITrigger,
  ITriggerTypeConfig
} from 'core/domain';
import { PIPELINE_CONFIG_PROVIDER } from 'core/pipeline/config/pipelineConfigProvider';

export interface IStageValidationResults {
  stage: IStage;
  messages: string[];
}

export interface IPipelineValidationResults {
  stages: IStageValidationResults[];
  pipeline: string[];
  hasWarnings?: boolean;
  preventSave?: boolean;
}

export interface IValidatorConfig {
  type: string;
  message?: string;
  skipValidation?: (pipeline: IPipeline, stage: IStage) => boolean;
  preventSave?: boolean;
  fieldName?: string;
  fieldLabel?: string;
  checkParentTriggers?: boolean;
}

export interface IStageOrTriggerValidator {
  validate(pipeline: IPipeline,
           stageOrTrigger: IStage | ITrigger,
           validator: IValidatorConfig,
           config: IStageOrTriggerTypeConfig): string | ng.IPromise<string>;
}

export interface ICustomValidator extends IStageOrTriggerValidator, IValidatorConfig {
  [k: string]: any;
}

export class PipelineConfigValidator implements ng.IServiceProvider {

  private validators: Map<string, IStageOrTriggerValidator> = new Map();
  private validationStream: Subject<IPipelineValidationResults> = new Subject();

  public registerValidator(type: string, validator: IStageOrTriggerValidator) {
    this.validators.set(type, validator);
  }

  constructor(private $log: ng.ILogService,
              private $q: ng.IQService,
              private pipelineConfig: any) {
    'ngInject';
  }

  public validatePipeline(pipeline: IPipeline): ng.IPromise<IPipelineValidationResults> {
    const stages: IStage[] = pipeline.stages || [],
          triggers: ITrigger[] = pipeline.triggers || [],
          validations: ng.IPromise<string>[] = [],
          pipelineValidations: string[] = this.getPipelineLevelValidations(pipeline),
          stageValidations: Map<IStage, string[]> = new Map();
    let preventSave = false;

    triggers.forEach((trigger, index) => {
      const config: ITriggerTypeConfig = this.pipelineConfig.getTriggerConfig(trigger.type);
      if (config && config.validators) {
        config.validators.forEach((validator) => {
          const typedValidator = this.getValidator(validator);
          if (!typedValidator) {
            this.$log.warn(`No validator of type "${validator.type}" found, ignoring validation on trigger "${(index + 1)}" (${trigger.type})`);
          } else {
            validations.push(
              this.$q.resolve<string>(typedValidator.validate(pipeline, trigger, validator, config))
                .then(message => {
                  if (message && !pipelineValidations.includes(message)) {
                    pipelineValidations.push(message);
                    if (validator.preventSave) {
                      preventSave = true;
                    }
                  }
                  return message;
                })
            );
          }
        });
      }
    });
    stages.forEach((stage) => {
      const config: IStageTypeConfig = this.pipelineConfig.getStageConfig(stage);
      if (config && config.validators) {
        config.validators.forEach((validator) => {
          if (validator.skipValidation && validator.skipValidation(pipeline, stage)) {
            return;
          }
          const typedValidator = this.getValidator(validator);
          if (!typedValidator) {
            this.$log.warn(`No validator of type "${validator.type}" found, ignoring validation on stage "${stage.name}" (${stage.type})`);
          } else {
            validations.push(
              this.$q.resolve<string>(typedValidator.validate(pipeline, stage, validator, config)).then((message: string) => {
                if (message) {
                  if (!stageValidations.has(stage)) {
                    stageValidations.set(stage, [] as string[]);
                  }
                  if (!stageValidations.get(stage).includes(message)) {
                    stageValidations.get(stage).push(message);
                    if (validator.preventSave) {
                      preventSave = true;
                    }
                  }
                }
                return message;
              })
            );
          }
        });
      }
    });

    return this.$q.all(validations).then(() => {
      const results = {
        stages: Array.from(stageValidations).map(([stage, messages]) => ({ stage, messages })),
        pipeline: pipelineValidations,
        hasWarnings: false,
        preventSave,
      };
      results.hasWarnings = results.pipeline.length > 0 || results.stages.length > 0;
      this.validationStream.next(results);
      return results;
    });
  }

  private getValidator(validator: IValidatorConfig): IStageOrTriggerValidator {
    return validator.type === 'custom' ? validator as ICustomValidator : this.validators.get(validator.type);
  }

  private getPipelineLevelValidations(pipeline: IPipeline): string[] {
    const messages: string[] = [];
    if ((pipeline.parameterConfig || []).some(p => !p.name)) {
      messages.push('<b>Name</b> is a required field for parameters.');
    }
    if (pipeline.strategy && !(pipeline.stages.some(stage => stage.type === 'deploy'))) {
      messages.push('To be able to create new server groups, a custom strategy should contain a Deploy stage.');
    }
    return messages;
  }

  /**
   * Subscribes to validation events
   * @param method
   * @returns {Subscription}, which should be unsubscribed when the subscriber is destroyed
   */
  public subscribe(method: (result: IPipelineValidationResults) => any): Subscription {
    return this.validationStream.subscribe(method);
  }

  public $get() {
    return this;
  }

}

export const PIPELINE_CONFIG_VALIDATOR = 'spinnaker.core.pipeline.config.validator';
module(PIPELINE_CONFIG_VALIDATOR, [
  PIPELINE_CONFIG_PROVIDER,
]).service('pipelineConfigValidator', PipelineConfigValidator)
  .run((pipelineConfigValidator: PipelineConfigValidator) => {
    // placeholder - custom validators must implement the ICustomValidator interface
    pipelineConfigValidator.registerValidator('custom', null);
  });
