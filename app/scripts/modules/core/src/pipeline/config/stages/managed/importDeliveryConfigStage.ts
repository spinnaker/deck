import { Registry } from 'core/registry';
import { ExecutionDetailsTasks } from 'core/pipeline';

import { ImportDeliveryConfigStageConfig } from './ImportDeliveryConfigStageConfig';
import { ImportDeliveryConfigExecutionDetails } from './ImportDeliveryConfigExecutionDetails';
import { IStageOrTriggerBeforeTypeValidationConfig } from 'core/pipeline/config/validation/stageOrTriggerBeforeType.validator';
import { SETTINGS } from 'core/config';

if (SETTINGS.feature.managedDelivery) {
  Registry.pipeline.registerStage({
    label: 'Import Delivery Config',
    description:
      "Retrieve a Delivery Config manifest from the git repository configured in the pipeline's trigger, then update it in Spinnaker.",
    extendedDescription: `<a target="_blank" href="https://www.spinnaker.io/reference/managed-delivery/gitops.md">
      <span class="small glyphicon glyphicon-file"></span> Documentation</a>`,
    key: 'importDeliveryConfig',
    restartable: false,
    component: ImportDeliveryConfigStageConfig,
    executionDetailsSections: [ImportDeliveryConfigExecutionDetails, ExecutionDetailsTasks],
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
