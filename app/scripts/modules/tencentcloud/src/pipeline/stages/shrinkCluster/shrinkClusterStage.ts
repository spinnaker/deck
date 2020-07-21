import { validate } from './shrinkClusterValidators';
import { Registry, IStageTypeConfig } from '@spinnaker/core';
import { ShrinkClusterConfig } from './ShrinkClusterConfig';

Registry.pipeline.registerStage({
  provides: 'shrinkCluster',
  key: 'shrinkCluster',
  cloudProvider: 'tencentcloud',
  component: ShrinkClusterConfig,
  validateFn: validate,
} as IStageTypeConfig);
