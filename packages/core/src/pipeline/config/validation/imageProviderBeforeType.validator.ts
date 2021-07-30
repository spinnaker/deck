import { IStageOrTriggerValidator, IValidatorConfig, PipelineConfigValidator } from './PipelineConfigValidator';
import { ICluster, IPipeline, IStage, IStageOrTriggerTypeConfig } from '../../../domain';

export interface IImageProviderBeforeTypeValidationConfig extends IValidatorConfig {
  triggerTypes?: string[];
  message: string;
}

export class ImageProviderBeforeTypeValidator implements IStageOrTriggerValidator {
  public validate( 
    pipeline: IPipeline,
    stage: IStage,
    validator: IImageProviderBeforeTypeValidationConfig,
    _config: IStageOrTriggerTypeConfig,
  ): string {

    const triggersToTest = pipeline.triggers || [];
    const hasImageProvider = Boolean(triggersToTest.length) && triggersToTest.every((trigger) => (validator.triggerTypes || []).includes(trigger.type));

    const hasCustomImage = (stage.clusters || []).every((cluster: ICluster) => cluster.imageId && cluster.imageId !== '${trigger.properties.imageName}');

    if (!hasImageProvider && !hasCustomImage) {
      return `${validator.message} Add a trigger or manually input the imageId. Suggested triggers: ${(validator.triggerTypes || []).join(', ')}`;
    }

    return null;
  }
}

PipelineConfigValidator.registerValidator('imageProviderBeforeType', new ImageProviderBeforeTypeValidator());