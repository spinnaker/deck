'use strict';

import {RUN_AS_USER_SELECTOR_COMPONENT} from './runAsUserSelector.component';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.trigger', [
    require('../stages/stage.module.js'),
    require('./cron/cronTrigger.module.js'),
    require('./docker/dockerTrigger.module.js'),
    require('./git/gitTrigger.module.js'),
    require('./ci/ciTrigger.module.js'),
    require('./pipeline/pipelineTrigger.module.js'),
    require('./trigger.directive.js'),
    require('./triggers.directive.js'),
    RUN_AS_USER_SELECTOR_COMPONENT,
  ]);
