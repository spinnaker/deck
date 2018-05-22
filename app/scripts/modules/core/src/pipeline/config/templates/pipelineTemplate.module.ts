import { module } from 'angular';

import { CONFIGURE_PIPELINE_TEMPLATE_MODAL_CTRL } from './configurePipelineTemplateModal.controller';
import { TEMPLATE_PLAN_ERRORS } from './templatePlanErrors.component';
import { VARIABLE } from './variable.component';

import './inputs/BooleanInput';
import './inputs/ListInput';
import './inputs/NumberInput';
import './inputs/ObjectInput';
import './inputs/StringInput';

import './validators/list.validator';
import './validators/number.validator';
import './validators/object.validator';
import './validators/string.validator';

export const PIPELINE_TEMPLATE_MODULE = 'spinnaker.core.pipelineTemplate.module';
module(PIPELINE_TEMPLATE_MODULE, [CONFIGURE_PIPELINE_TEMPLATE_MODAL_CTRL, TEMPLATE_PLAN_ERRORS, VARIABLE]);
