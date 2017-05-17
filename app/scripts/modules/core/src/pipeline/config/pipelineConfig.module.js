'use strict';

const angular = require('angular');

import { PIPELINE_GRAPH_COMPONENT } from './graph/pipeline.graph.component';
import { REQUIRED_FIELD_VALIDATOR } from './validation/requiredField.validator';
import { SERVICE_ACCOUNT_ACCESS_VALIDATOR } from './validation/serviceAccountAccess.validator';
import { STAGE_BEFORE_TYPE_VALIDATOR } from './validation/stageBeforeType.validator';
import { STAGE_OR_TRIGGER_BEFORE_TYPE_VALIDATOR } from './validation/stageOrTriggerBeforeType.validator';
import { TARGET_IMPEDANCE_VALIDATOR } from './validation/targetImpedance.validator';

import './pipelineConfig.less';

module.exports = angular.module('spinnaker.core.pipeline.config', [
  require('./actions/actions.module.js'),
  PIPELINE_GRAPH_COMPONENT,
  require('./stages/stage.module.js'),
  require('./stages/baseProviderStage/baseProviderStage.js'),
  require('./triggers/trigger.module.js'),
  require('./parameters/pipeline.module.js'),
  require('./pipelineConfig.controller.js'),
  require('./pipelineConfigView.js'),
  require('./pipelineConfigurer.js'),
  REQUIRED_FIELD_VALIDATOR,
  TARGET_IMPEDANCE_VALIDATOR,
  STAGE_OR_TRIGGER_BEFORE_TYPE_VALIDATOR,
  STAGE_BEFORE_TYPE_VALIDATOR,
  SERVICE_ACCOUNT_ACCESS_VALIDATOR,
  require('./targetSelect.directive.js'),
  require('./createNew.directive.js'),
  require('./health/stagePlatformHealthOverride.directive.js'),
]);
