import { Registry } from 'core/registry';
import { ExecutionDetailsTasks } from 'core/pipeline';

import { PublishDeliveryConfigStageConfig } from './PublishDeliveryConfigStageConfig';
import { PublishDeliveryConfigExecutionDetails } from './PublishDeliveryConfigExecutionDetails';
import { IStageOrTriggerBeforeTypeValidationConfig } from 'core/pipeline/config/validation/stageOrTriggerBeforeType.validator';
import { SETTINGS } from 'core/config';

if (SETTINGS.feature.managedDelivery) {
  Registry.pipeline.registerStage({
    label: 'Publish Delivery Config',
    description: 'Publish Delivery Config Manifest',
    key: 'publishDeliveryConfig',
    restartable: false,
    component: PublishDeliveryConfigStageConfig,
    executionDetailsSections: [PublishDeliveryConfigExecutionDetails, ExecutionDetailsTasks],
    //validateFn: validate,
    validators: [
      {
        type: 'stageOrTriggerBeforeType',
        stageType: 'git',
        message: 'This stage requires a git trigger to locate your Delivery Config manifest.',
      } as IStageOrTriggerBeforeTypeValidationConfig,
    ],
  });
}
