import { validate } from './disableSGValidators';
import { Registry } from '@spinnaker/core';
import { DisableSGConfig } from './DisableSGConfig';

Registry.pipeline.registerStage({
  provides: 'disableServerGroup',
  key: 'disableServerGroup',
  cloudProvider: 'tencentcloud',
  component: DisableSGConfig,
  validateFn: validate,
});
