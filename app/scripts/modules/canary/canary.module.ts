import { module } from 'angular';

import './canary.help';

import './canary.less';
import { CANARY_ACATASK_ACATASKSTAGE_MODULE } from './acaTask/acaTaskStage.module';
import { CANARY_CANARY_CANARYSTAGE_MODULE } from './canary/canaryStage.module';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const CANARY_MODULE = 'spinnaker.canary';
module(CANARY_MODULE, [CANARY_ACATASK_ACATASKSTAGE_MODULE, CANARY_CANARY_CANARYSTAGE_MODULE]);
