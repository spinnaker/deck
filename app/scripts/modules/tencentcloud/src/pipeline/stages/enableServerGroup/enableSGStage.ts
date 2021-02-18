import { validate } from './enableSGValidators';
import { Registry } from '@spinnaker/core';
import { EnableSGConfig } from './EnableSGConfig';

Registry.pipeline.registerStage({
  provides: 'enableServerGroup',
  key: 'enableServerGroup',
  cloudProvider: 'tencentcloud',
  component: EnableSGConfig,
  validateFn: validate,
});
