import { Registry } from 'core/registry';
import { ExecutionDetailsTasks } from 'core/pipeline';

import { PublishDeliveryConfigStageConfig } from './PublishDeliveryConfigStageConfig';
import { PublishDeliveryConfigExecutionDetails } from './PublishDeliveryConfigExecutionDetails';
import { IStageOrTriggerBeforeTypeValidationConfig } from 'core/pipeline/config/validation/stageOrTriggerBeforeType.validator';

Registry.pipeline.registerStage({
  label: 'Publish Managed Delivery Manifest',
  description: 'Publish Managed Delivery Manifest',
  key: 'publishDeliveryConfig',
  restartable: false,
  component: PublishDeliveryConfigStageConfig,
  executionDetailsSections: [PublishDeliveryConfigExecutionDetails, ExecutionDetailsTasks],
  //validateFn: validate,
  // TODO: figure out why validator is not working
  validators: [
    {
      type: 'stageOrTriggerBeforeType',
      stageType: 'git',
      message: 'This stage requires a git trigger to locate your Delivery Config manifest.',
    } as IStageOrTriggerBeforeTypeValidationConfig,
  ],
});
